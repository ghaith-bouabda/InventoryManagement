package com.pfe.GestionDuStock.user;

import com.pfe.GestionDuStock.user.User;
import com.pfe.GestionDuStock.user.userDTO;
import org.springframework.stereotype.Component;

@Component
public class userMapper {

    public userDTO toDTO(User user) {
        return new userDTO(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getPassword(),
                user.getRole()
        );
    }

    public User toEntity(userDTO userDTO) {
        return User.builder()
                .id(userDTO.id())
                .username(userDTO.username())
                .email(userDTO.email())
                .password(userDTO.password())
                .role(userDTO.role())
                .build();
    }
}
