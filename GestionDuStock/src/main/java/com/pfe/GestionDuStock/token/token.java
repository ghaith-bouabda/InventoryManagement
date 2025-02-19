package com.pfe.GestionDuStock.token;

import com.pfe.GestionDuStock.user.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity
public class token {
    @ManyToOne
    @JoinColumn(name = "user_id")

    private User user;
    @Id
    @GeneratedValue
    private Long id;
    private String token;
    @Enumerated(EnumType.STRING)
    private TokenType  tokenType;

    private boolean expired;
    private boolean revoked;

}