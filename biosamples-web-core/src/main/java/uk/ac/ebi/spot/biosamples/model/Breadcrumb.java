package uk.ac.ebi.spot.biosamples.model;

import javax.servlet.http.HttpServletRequest;
import java.util.*;
import java.util.function.Consumer;
import java.util.stream.Collectors;

/**
 * Created by lucacherubin on 2016/04/08.
 */
public class Breadcrumb {

//    List<String> pageNames;
//    List<String> pageRelativePath;
//    List<NameUrlTuple> pageTuples;

//    public Breadcrumb(HttpServletRequest request) {
//        pageNames = Arrays.asList(request.getContextPath().split("/"));
//        pageNames = pageNames.subList(1,pageNames.size());
//        List<String> pageRelativePath = new ArrayList<>();
//
//        for(String pageName: pageNames) {
//            if (pageRelativePath.isEmpty()) {
//                pageRelativePath.add(String.format("/%s",pageName));
//            } else {
//                String relPath = String.format("%s/%s",
//                                                pageRelativePath.get(pageRelativePath.size() - 1),
//                                                pageName);
//                pageRelativePath.add(relPath);
//            }
//        }
//        pageRelativePath.add(0,"/");
//
//        if(pageNames.size() == pageRelativePath.size()) {
//            pageTuples = new ArrayList<>();
//            for(int i=0; i < pageNames.size(); i++) {
//                pageTuples.add(new NameUrlTuple(pageNames.get(i),pageRelativePath.get(i)));
//            }
//        }
//    }
//
//    public List<NameUrlTuple> getStructure() {
//        return this.pageTuples;
//    }

    List<NameUrlTuple> structure;

    public Breadcrumb() {
        structure = new ArrayList<>();
    }

    public void addPage(String pageName, String url) {
        structure.add(new NameUrlTuple(pageName,url));
    }

    public List<NameUrlTuple> getStructure() {
        return structure;
    }




//    public List<String> getNames() {
//        return customizePageNames(this.pageNames);
//    }
//
//    public List<String> getLinks() {
//        return this.pageRelativePath;
//    }


//    private List<String> customizePageNames(List<String> pageNames) {
//        return pageNames;
//    }

    private class NameUrlTuple {

        String name;
        String url;

        public NameUrlTuple(String name, String url) {
            this.name = name;
            this.url = url;
        }

        public String getName() {
            return customizeName(name);
        }

        public String getUrl() {
            return url;
        }

        private String customizeName(String name) {
            return name;
        }


    }

}
