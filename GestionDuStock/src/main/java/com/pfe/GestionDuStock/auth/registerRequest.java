package com.pfe.GestionDuStock.auth;

import com.pfe.GestionDuStock.user.Role;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class registerRequest {
    private String Username;
    private String email;
    private String password;
    private Role role;


}
