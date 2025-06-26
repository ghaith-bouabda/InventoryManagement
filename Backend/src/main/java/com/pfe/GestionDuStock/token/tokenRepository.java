package com.pfe.GestionDuStock.token;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface tokenRepository extends JpaRepository<token, Integer> {
    @Query(value = """
      select t from token t inner join User u
      on t.user.id = u.id
      where u.id = :id and (t.expired = false or t.revoked = false)
      """)
    List<token> findAllValidTokenByUser(Long id);
    Optional<token> findByToken(String token);
}
