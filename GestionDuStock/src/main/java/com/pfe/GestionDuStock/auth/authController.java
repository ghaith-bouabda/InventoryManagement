package com.pfe.GestionDuStock.auth;

import com.pfe.GestionDuStock.user.User;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class authController {
    private final authService authenticationService;

    @PostMapping("/register")
    public ResponseEntity<authResponse> register
            (@RequestBody registerRequest request )
    {
        return ResponseEntity.ok(authenticationService.register(request));
    }




    @PostMapping("/auth")
    public ResponseEntity<authResponse> authentication
            (@RequestBody authRequest request )
    {
        return ResponseEntity.ok(authenticationService.authenticate(request));
    }

    @PostMapping("/refresh")
    public void refresh (
            HttpServletRequest request,
            HttpServletResponse response
    ) throws IOException {
        authenticationService.refreshToken(request,response);
    }
    @GetMapping("/me")
    public User getCurrentUser(@AuthenticationPrincipal User user) {
        return user;
    }
}
