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

import org.apache.http.client.config.RequestConfig;
import org.apache.http.impl.conn.PoolingClientConnectionManager;
import org.apache.http.impl.conn.PoolingHttpClientConnectionManager;
import org.glassfish.jersey.client.ClientConfig;
import org.glassfish.jersey.client.ClientProperties;
import org.glassfish.jersey.client.JerseyClientBuilder;
import org.glassfish.jersey.client.spi.Connector;
import org.glassfish.jersey.jackson.JacksonFeature;
import org.glassfish.jersey.apache.connector.ApacheClientProperties;
import org.glassfish.jersey.apache.connector.ApacheConnectorProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import uk.co.flax.biosolr.ontology.core.OntologyHelperException;

import javax.ws.rs.NotFoundException;
import javax.ws.rs.client.Client;
import javax.ws.rs.client.ClientBuilder;
import javax.ws.rs.core.MediaType;
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

	private static final Client client;
	private final ExecutorService executor;
	

	static {
	    ClientConfig clientConfig = new ClientConfig();
	    // values are in milliseconds
	    clientConfig.property(ClientProperties.READ_TIMEOUT, 30000);
	    clientConfig.property(ClientProperties.CONNECT_TIMEOUT, 1000);
	    
	    //have to use the deprecated one for Jersey compatability
	    PoolingClientConnectionManager connectionManager = new PoolingClientConnectionManager();
	    connectionManager.setMaxTotal(100);
	    connectionManager.setDefaultMaxPerRoute(100);
	    
	    // tell the config about the connection manager
	    clientConfig.property(ApacheClientProperties.CONNECTION_MANAGER, connectionManager);
	    clientConfig.property(ApacheClientProperties.REQUEST_CONFIG, RequestConfig.custom()
	    		  .setConnectTimeout(1000)
	    		  .setSocketTimeout(30000)
	    		  .build());
	    clientConfig.connectorProvider(new ApacheConnectorProvider());
	    
	    client = ClientBuilder.newClient(clientConfig)
				.register(ObjectMapperResolver.class)
				.register(JacksonFeature.class);
		
	}

	/**
	 * Construct an HTTP client for accessing the OLS web API.
	 * @param threadPoolSize the size of the threadpool to use.
	 * @param threadFactory the thread factory to use to build the client
	 * threads.
	 */
	public OLSHttpClient(int threadPoolSize, ThreadFactory threadFactory) {
		
		// Initialise the HTTP client
		//done statically

		// Initialise the concurrent executor

		// Initialise the concurrent executor
		this.executor = Objects.isNull(threadFactory) ?
				Executors.newFixedThreadPool(threadPoolSize) :
				Executors.newFixedThreadPool(threadPoolSize, threadFactory);
		LOGGER.info("Initialising OLS HTTP client");
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
		//client.close();
		
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

		urls.forEach(url -> calls.add(() ->
			client.target(url).request(MediaType.APPLICATION_JSON_TYPE).get(clazz)
		));

		return calls;
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
				T result = null;
				try {
					result = h.get();
					//should this only add if there was no error? or add null if an exception was thrown?
					ret.add(result);
				} catch (ExecutionException e) {
					if (e.getCause() instanceof NotFoundException) {
						NotFoundException nfe = (NotFoundException)e.getCause();
						LOGGER.trace("Caught NotFoundException: {}", nfe.getResponse().toString());
					} else {
						LOGGER.error(e.getMessage(), e);
					}
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
