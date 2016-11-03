/**
 * Copyright (c) 2015 Lemur Consulting Ltd.
 * <p>
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * <p>
 * http://www.apache.org/licenses/LICENSE-2.0
 * <p>
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package uk.co.flax.biosolr.ontology.core.ols;
import org.apache.http.HeaderElement;
import org.apache.http.HeaderElementIterator;
import org.apache.http.HttpException;
import org.apache.http.HttpHeaders;
import org.apache.http.HttpResponse;
import org.apache.http.client.config.RequestConfig;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.protocol.HttpClientContext;
import org.apache.http.conn.ConnectionKeepAliveStrategy;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.impl.conn.PoolingHttpClientConnectionManager;
import org.apache.http.protocol.HTTP;
import org.apache.http.protocol.HttpContext;
import org.apache.http.util.EntityUtils;
import org.apache.http.message.BasicHeaderElementIterator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;

import uk.co.flax.biosolr.ontology.core.OntologyHelperException;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Objects;
import java.util.concurrent.*;

/**
 * HTTP Client class for calling OLS.
 *
 * <p>Created by Matt Pearce on 10/12/15.</p>
 * @author Matt Pearce
 */
public class OLSHttpClient {

	private static final Logger LOGGER = LoggerFactory.getLogger(OLSHttpClient.class);

	private final CloseableHttpClient httpClient;
	private final ObjectMapper objectMapper;
	private final ExecutorService executor;

	/**
	 * Construct an HTTP client for accessing the OLS web API.
	 * @param threadPoolSize the size of the threadpool to use.
	 * @param threadFactory the thread factory to use to build the client
	 * threads.
	 */
	public OLSHttpClient(int threadPoolSize, ThreadFactory threadFactory) {
		//Initialise the oBject Mapper
		this.objectMapper = new ObjectMapper();
		this.objectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
				
		// Initialise the HTTP client pool 
		PoolingHttpClientConnectionManager connManager = new PoolingHttpClientConnectionManager();
		connManager.setMaxTotal(threadPoolSize);
		connManager.setDefaultMaxPerRoute(threadPoolSize);
		connManager.setValidateAfterInactivity(100);
		ConnectionKeepAliveStrategy myStrategy = new ConnectionKeepAliveStrategy() {
		    @Override
		    public long getKeepAliveDuration(HttpResponse response, HttpContext context) {
		        HeaderElementIterator it = new BasicHeaderElementIterator(response.headerIterator(HTTP.CONN_KEEP_ALIVE));
		        while (it.hasNext()) {
		            HeaderElement he = it.nextElement();
		            String param = he.getName();
		            String value = he.getValue();
		            if (value != null && param.equalsIgnoreCase
		               ("timeout")) {
		                return Long.parseLong(value) * 1000;
		            }
		        }
		        return 5 * 1000;
		    }
		};
		httpClient = HttpClients.custom()
		        .setConnectionManager(connManager)
		        .setKeepAliveStrategy(myStrategy)
		        .build();
		
		// Initialise the concurrent executor
		this.executor = Objects.isNull(threadFactory) ?
				Executors.newFixedThreadPool(threadPoolSize) :
				Executors.newFixedThreadPool(threadPoolSize, threadFactory);
		LOGGER.trace("Initialising OLS HTTP client with threadpool size {}", threadPoolSize);
	}

	/**
	 * Shut down the client.
	 */
	public void shutdown() {
		executor.shutdown();
		try {
			executor.awaitTermination(1, TimeUnit.MINUTES);
		} catch (InterruptedException e) {
			LOGGER.warn("Interrupted during shutdown termination");
		}
		try {
			httpClient.close();
		} catch (IOException e) {
			LOGGER.warn("Problem closing http client",e);
		}
	}

	/**
	 * Call the OLS service with a collection of URLs, each of which should
	 * resolve to the same object type.
	 * @param urls the URLs to call.
	 * @param clazz the class being returned.
	 * @param <T> the type of object being returned.
	 * @return a collection of objects. Never <code>null</code>.
	 * @throws OntologyHelperException if problems occur making the calls.
	 */
	public <T> List<T> callOLS(final Collection<String> urls, final Class<T> clazz) throws OntologyHelperException {
		List<Callable<T>> calls = createCalls(urls, clazz);
		return executeCalls(calls);
	}

	/**
	 * Build a list of calls, each returning the same object type.
	 * @param urls the URLs to be called.
	 * @param clazz the type of object returned by the call.
	 * @param <T> placeholder for the clazz parameter.
	 * @return a list of Callable requests.
	 */
	private <T> List<Callable<T>> createCalls(Collection<String> urls, Class<T> clazz) {
		List<Callable<T>> calls = new ArrayList<>(urls.size());

		for (String url : urls) {
			calls.add(new RequestCallable<T>(url, clazz));
		}
		return calls;
	}
	
	private class RequestCallable<T> implements Callable<T>{
		private final String url;
		private final Class<T> clazz;
		private HttpClientContext context;
		public RequestCallable(String url, Class<T> clazz) {
			this.url = url;
			this.clazz = clazz;
	        this.context = HttpClientContext.create();
		}
		@Override
		public T call() throws Exception {
			//construct the HTTP reuqest
			HttpGet request = new HttpGet(url);
			request.addHeader(HttpHeaders.ACCEPT, "application/json");
			//actually send the request and handle the response
			try (CloseableHttpResponse response = httpClient.execute(request, context);) {
				int status = response.getStatusLine().getStatusCode();
				if (status == 200) {
					return objectMapper.readValue(response.getEntity().getContent(), clazz);
				} else if (status == 404){
					//silently ignore fail
					EntityUtils.consume(response.getEntity());
					return null;
				} else {
					EntityUtils.consume(response.getEntity());
					throw new HttpException("Status code "+status+" for "+url);
				}
			}
		}
	}

	/**
	 * Asynchronously carry out a list of callable tasks, such as looking up
	 * ontology terms, returning the objects deserialized from the returned
	 * data.
	 * @param calls the list of calls to make.
	 * @param <T> the type of object to deserialize.
	 * @return a list of deserialized objects.
	 * @throws OntologyHelperException if the calls are interrupted while
	 * being made.
	 */
	private <T> List<T> executeCalls(final List<Callable<T>> calls) throws OntologyHelperException {
		List<T> ret = new ArrayList<>(calls.size());

		try {
			List<Future<T>> holders = executor.invokeAll(calls);
			holders.forEach(h -> {
				try {
					T result = h.get();
					if (result != null) {
						ret.add(result);
					}
				} catch (ExecutionException e) {
					LOGGER.error(e.getMessage(), e);
				} catch (InterruptedException e) {
					LOGGER.error(e.getMessage());
				}
			});
		} catch (InterruptedException e) {
			Thread.interrupted();
			throw new OntologyHelperException(e);
		}

		return ret;
	}

}
