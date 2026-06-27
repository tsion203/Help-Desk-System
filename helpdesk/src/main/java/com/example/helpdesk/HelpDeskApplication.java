package com.example.helpdesk;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class HelpDeskApplication implements CommandLineRunner {

	public static void main(String[] args) {
		SpringApplication.run(HelpDeskApplication.class, args);
	}
	 @Override
    public void run(String... args) throws Exception {
        System.out.println("✅✅✅ WOOOHOOO! DATABASE CONNECTED SUCCESSFULLY! ✅✅✅");
    }
}


/*import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class MyProjectApplication implements CommandLineRunner {

    public static void main(String[] args) {
        SpringApplication.run(MyProjectApplication.class, args);
    }

    // This code ONLY runs if the app and database start successfully!
    @Override
    public void run(String... args) throws Exception {
        System.out.println("✅✅✅ WOOOHOOO! DATABASE CONNECTED SUCCESSFULLY! ✅✅✅");
    }
} */