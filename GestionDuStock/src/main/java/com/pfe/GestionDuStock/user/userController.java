package com.pfe.GestionDuStock.user;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class userController {

    private final userService userService;
    private final userMapper userMapper;

    @GetMapping("/{id}")
    public userDTO getUserById(@PathVariable Long id) {
        return userService.getUserById(id);
    }

    @GetMapping
    public List<userDTO> getAllUsers() {
        return userService.getAllUsers();
    }

    @GetMapping("/getuser")
    public Optional<userDTO> getuser(@RequestParam String username) {
        return userService.getuser(username);
    }

    @GetMapping("/me")
    public userDTO getCurrentUser(@AuthenticationPrincipal User user) {
        return userMapper.toDTO(user); // Convert authenticated User to DTO
    }
}
