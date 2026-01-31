package com.example.FarmXChain;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private PasswordEncoder encoder;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        System.out.println("Processing registration for: " + user.getEmail() + " with role: " + user.getRole());
        try {
            // 1. Validate Email Format
            if (!user.getEmail().matches("^[A-Za-z0-9+_.-]+@(.+)$")) {
                System.out.println("Invalid email format for: " + user.getEmail());
                return ResponseEntity.badRequest().body("Invalid email format");
            }

            // 2. Validate Password Strength
            if (!user.getPassword().matches("^(?=.*[0-9]).{8,}$")) {
                System.out.println("Weak password for: " + user.getEmail());
                return ResponseEntity.badRequest().body("Password must be at least 8 characters long and contain at least one number");
            }

            if (userRepository.existsByEmail(user.getEmail())) {
                System.out.println("Email already exists in DB: " + user.getEmail());
                return ResponseEntity.badRequest().body("Email already exists");
            }
            user.setPassword(encoder.encode(user.getPassword()));
            
            // Default status logic
            if (user.getRole() == Role.FARMER) {
                user.setStatus(UserStatus.PENDING);
            } else {
                user.setStatus(UserStatus.ACTIVE);
            }
            
            userRepository.save(user);
            System.out.println("User registered successfully: " + user.getEmail());
            return ResponseEntity.ok(Map.of("message", "User registered successfully"));
        } catch (Exception e) {
            e.printStackTrace();
            throw e; // Will be caught by GlobalExceptionHandler
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String password = request.get("password");

        try {
            authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(email, password));
        } catch (Exception e) {
            return ResponseEntity.status(401).body("Invalid credentials");
        }

        User user = userRepository.findByEmail(email).orElseThrow();
        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name(), user.getName());
        
        return ResponseEntity.ok(Map.of(
            "token", token,
            "role", user.getRole(),
            "name", user.getName()
        ));
    }
}
