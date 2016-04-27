package uk.ac.ebi.spot.biosamples.model;

/**
 * Created by lucacherubin on 01/03/2016.
 */
public class SearchRequest {

    private String searchTerm = "*";
    private boolean useFuzzySearch = false;
    private int rows = 10;
    private int start = 0;
    private String typeFilter = "";
    private String organismFilter = "";
    private String organFilter = "";

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

    public String getTypeFilter() {
                                return typeFilter;
                                                  }

    public void setTypeFilter(String typeFilter) {
                                               this.typeFilter = typeFilter;
                                                                            }

    public String getOrganismFilter() {
                                    return organismFilter;
                                                          }

    public void setOrganismFilter(String organismFilter) {
                                                       this.organismFilter = organismFilter;
                                                                                            }

    public String getOrganFilter() {
                                 return organFilter;
                                                    }

    public void setOrganFilter(String organFilter) {
        this.organFilter = organFilter;
    }

    public String getFuzzyfiedTerm() {

            return this.getSearchTerm().replaceAll("(\\w+)","$0~");

    }


}


