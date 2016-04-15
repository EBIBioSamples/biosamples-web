package uk.ac.ebi.spot.biosamples.model;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Created by lucacherubin on 01/03/2016.
 */
public class SearchRequest {

    private String searchTerm = "*";
    private String[] filters = {};
    private boolean useFuzzySearch = false;
    private int rows = 10;
    private int start = 0;

    public String[] getFilters() {
        return filters;
    }

    public void setFilters(String[] filters) {
        this.filters = filters;
    }

    public String getSearchTerm() {
                                return searchTerm;
                                                  }

    public void setSearchTerm(String searchTerm) {
                                               this.searchTerm = searchTerm;
                                                                            }

    public boolean useFuzzySearch() {
                                  return useFuzzySearch;
                                                        }

    public void useFuzzySearch(boolean useFuzzySearch) {
                                                     this.useFuzzySearch = useFuzzySearch;
                                                                                          }

    public String getFuzzyfiedTerm() {

        return this.getSearchTerm().replaceAll("(\\w+)","$0~");

    }


    public int getRows() {
                       return rows;
                                   }

    public void setRows(int rows) {
                                this.rows = rows;
                                                 }

    public int getStart() {
        return start;
    }

    public void setStart(int start) {
                                  this.start = start;
                                                     }



}


