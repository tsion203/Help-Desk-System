package com.example.helpdesk.config;

import java.util.List;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import com.example.helpdesk.model.TicketCategory;
import com.example.helpdesk.repository.TicketCategoryRepository;

@Component
public class DefaultCategoryInitializer implements CommandLineRunner {
    private static final List<String> DEFAULT_CATEGORIES = List.of(
            "Hardware", "Software", "Network", "Email", "Printer", "Account Access",
            "Password Reset", "Internet", "Security", "System Installation",
            "General Inquiry", "Other");
    private final TicketCategoryRepository categoryRepository;

    public DefaultCategoryInitializer(TicketCategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @Override
    public void run(String... args) {
        DEFAULT_CATEGORIES.forEach(name -> categoryRepository.findByNameIgnoreCase(name).orElseGet(() -> {
            TicketCategory category = new TicketCategory();
            category.setName(name);
            category.setDescription("Help desk requests related to " + name.toLowerCase() + ".");
            return categoryRepository.save(category);
        }));
    }
}
