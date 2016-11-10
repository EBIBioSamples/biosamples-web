package uk.ac.ebi.spot.biosamples.filter;


import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.tuckey.web.filters.urlrewrite.Conf;
import org.tuckey.web.filters.urlrewrite.UrlRewriteFilter;
import org.tuckey.web.filters.urlrewrite.utils.StringUtils;

import javax.servlet.FilterConfig;
import javax.servlet.ServletContext;
import javax.servlet.ServletException;


public class ResourceAwareUrlRewriteFilter extends UrlRewriteFilter {
    private final ResourceLoader resourceLoader;

    private final Logger log = LoggerFactory.getLogger(getClass());

    protected Logger getLog() {
        return log;
    }

    @Autowired
    public ResourceAwareUrlRewriteFilter(ResourceLoader resourceLoader) {
        this.resourceLoader = resourceLoader;
    }

    @Override protected void loadUrlRewriter(FilterConfig filterConfig) throws ServletException {
        // try to load urlrewrite xml resource from application context
        try {
            // get init paramerers from context
            String confPath = StringUtils.trim(filterConfig.getInitParameter("confPath"));
            String modRewriteConf = filterConfig.getInitParameter("modRewriteConf");
            boolean modRewriteStyleConf = false;
            if (!StringUtils.isBlank(modRewriteConf)) {
                modRewriteStyleConf = "true".equals(StringUtils.trim(modRewriteConf).toLowerCase());
            }

            getLog().debug("URL rewrite rules to be loaded from '" + confPath + "'");
            Resource resource = resourceLoader.getResource(confPath);

            // get other configuration elements
            ServletContext context = filterConfig.getServletContext();
            if (context == null) {
                throw new NullPointerException("Servlet context is null");
            }

            getLog().debug("Initializing URL rewrite configuration...");
            Conf conf = new Conf(context, resource.getInputStream(), confPath, resource.getURL().toString(), modRewriteStyleConf);
            getLog().debug("URL rewrite configuration initializing OK, checking...");
            checkConf(conf);
        }
        catch (Exception e) {
            throw new ServletException(
                    "Failed to read rewrite configuration from " + filterConfig.getInitParameter("confPath"), e);
        }
    }
}
