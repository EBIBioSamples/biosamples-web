package uk.ac.ebi.spot.biosamples.repository.neo4j;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.repository.NoRepositoryBean;
import uk.ac.ebi.spot.biosamples.repository.ReadOnlyRepository;

@NoRepositoryBean
public interface ReadOnlyNeoRepository<T> extends ReadOnlyRepository<T, Long> {

    T findOne(Long id, int depth);

    Iterable<T> findAll(int depth);

    Iterable<T> findAll(Sort sort, int depth);

    Iterable<T> findAll(Iterable<Long> ids, int depth);

    Iterable<T> findAll(Iterable<Long> ids, Sort sort);

    Iterable<T> findAll(Iterable<Long> ids, Sort sort, int depth);


    Page<T> findAll(Pageable pageable, int depth);

}
