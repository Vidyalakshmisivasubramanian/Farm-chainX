package com.example.FarmXChain;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class SchemaFixer implements CommandLineRunner {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) throws Exception {
        System.out.println("DEBUG: Running SchemaFixer to ensure column lengths are correct...");
        try {
            // Fix crop_order status column
            jdbcTemplate.execute("ALTER TABLE crop_order MODIFY COLUMN status VARCHAR(20)");
            System.out.println("DEBUG: Successfully altered crop_order table.");
            
            // Fix shipment status column
            jdbcTemplate.execute("ALTER TABLE shipment MODIFY COLUMN status VARCHAR(20)");
            System.out.println("DEBUG: Successfully altered shipment table.");
            
        } catch (Exception e) {
            System.err.println("DEBUG: SchemaFixer warning (may already be fixed): " + e.getMessage());
        }
    }
}
