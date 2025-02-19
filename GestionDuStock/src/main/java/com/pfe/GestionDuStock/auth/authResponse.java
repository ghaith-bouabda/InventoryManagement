package com.pfe.GestionDuStock.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class authResponse {
    private String accessToken;
    private String refreshToken;

}
