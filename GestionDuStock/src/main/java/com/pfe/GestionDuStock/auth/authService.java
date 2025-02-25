package com.pfe.GestionDuStock.auth;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pfe.GestionDuStock.config.JwtService;
import com.pfe.GestionDuStock.exception.UserAlreadyExistsException;
import com.pfe.GestionDuStock.token.TokenType;
import com.pfe.GestionDuStock.token.token;
import com.pfe.GestionDuStock.token.tokenRepository;
import com.pfe.GestionDuStock.user.Role;
import com.pfe.GestionDuStock.user.User;
import com.pfe.GestionDuStock.user.userRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.io.IOException;

@Service
@RequiredArgsConstructor
public class authService {
    private final userRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final tokenRepository tokenRepository;



    //REGISTRATION
    public authResponse register(registerRequest RegisterRequest) {
        if (userRepository.existsByUsername(RegisterRequest.getUsername())) {
            throw new UserAlreadyExistsException("Username already taken");
        }
        if (userRepository.existsByEmail(RegisterRequest.getEmail())) {
            throw new UserAlreadyExistsException("Email already registered");
        }

        var user = User.builder()
                .username(RegisterRequest.getUsername())
                .password(passwordEncoder.encode(RegisterRequest.getPassword()))
                .email(RegisterRequest.getEmail())
                .role(Role.ADMIN)
                .build();

        var savedUser = userRepository.save(user);
        var JwtToken = jwtService.generateToken(user);
        var RefreshToken = jwtService.generateRefreshToken(user);

        SaveUserToken(savedUser, JwtToken);
        return authResponse.builder()
                .accessToken(JwtToken)
                .refreshToken(RefreshToken)
                .build();
    }

    private void RevokeUserToken(User user) {
        var UserAllTokens = tokenRepository.findAllValidTokenByUser(user.getId());
        if (UserAllTokens.isEmpty()) {
            return;
        }
        UserAllTokens.forEach(token -> {
            token.setExpired(true);
            token.setRevoked(true);
        });
        tokenRepository.saveAll(UserAllTokens);
    }

    //SAVING THE USER'S TOKEN METHOD
    private void SaveUserToken(User User, String JwtToken) {
        var Token= token.builder()
                .user(User)
                .token(JwtToken)
                .expired(false)
                .revoked(false)
                .tokenType(TokenType.Bearer)
                .build();
        tokenRepository.save(Token);
    }
    //AUTHENTICATION
    public authResponse authenticate(authRequest authenticationRequest) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken
                        (
                                authenticationRequest.getUsername(),
                                authenticationRequest.getPassword()
                        ));
        var user = userRepository.findByUsername(authenticationRequest.getUsername())
                .orElseThrow();
        var JwtToken= jwtService.generateToken(user);
        var RefreshToken= jwtService.generateRefreshToken(user);
        RevokeUserToken(user);
        SaveUserToken(user, JwtToken);
        return authResponse
                .builder()
                .accessToken(JwtToken)
                .refreshToken(RefreshToken)
                .build();
    }

    //REFRESH TOKEN
    public void refreshToken(HttpServletRequest request, HttpServletResponse response) throws IOException {
        final String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);
        final String refresh;
        final String Username;
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return;
        }
        refresh = authHeader.substring(7);
        Username= jwtService.extractUsername(refresh);
        if(Username !=null ){
            var user= this.userRepository.findByUsername(Username).orElseThrow();

            if (jwtService.isTokenValid(refresh,user) ) {
                var accessToken= jwtService.generateToken(user);
                RevokeUserToken(user);
                SaveUserToken(user, accessToken);
                var authResponse = com.pfe.GestionDuStock.auth.authResponse
                        .builder()
                        .accessToken(accessToken)
                        .refreshToken(refresh)
                        .build();
                new ObjectMapper().writeValue(response.getOutputStream(),authResponse);
            }
        }
    }
}