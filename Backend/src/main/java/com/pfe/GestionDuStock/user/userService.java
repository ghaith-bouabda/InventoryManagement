package com.pfe.GestionDuStock.user;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class userService {

    private final userRepository userRepository;
    private final userMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    public userDTO getUserById(Long id) {
        var user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return userMapper.toDTO(user); // Convert to DTO
    }

    public List<userDTO> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(userMapper::toDTO) // Convert each User to userDTO
                .collect(Collectors.toList());
    }

    public Optional<userDTO> getuser(String username) {
        return userRepository.findByUsername(username)
                .map(userMapper::toDTO); // Convert to DTO if found
    }
    public userDTO editUser(Long id, userDTO userDTO) {
        var user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setUsername(userDTO.username());
        user.setEmail(userDTO.email());
        if (userDTO.password() != null && !userDTO.password().isBlank()) {
            user.setPassword(passwordEncoder.encode(userDTO.password()));
        }

        user.setRole(userDTO.role());

        var updatedUser = userRepository.save(user);
        return userMapper.toDTO(updatedUser);
    }
    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("User not found");
        }
        userRepository.deleteById(id);
    }
}
