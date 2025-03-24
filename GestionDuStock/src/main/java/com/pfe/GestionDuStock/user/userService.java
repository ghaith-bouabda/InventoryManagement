package com.pfe.GestionDuStock.user;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class userService {

    private final userRepository userRepository;
    private final userMapper userMapper; // Inject userMapper

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
}
