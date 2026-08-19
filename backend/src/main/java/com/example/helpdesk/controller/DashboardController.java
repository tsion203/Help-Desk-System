package com.example.helpdesk.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.helpdesk.dto.DashboardResponseDTO;
import com.example.helpdesk.service.DashboardService;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {
    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','SUPERVISOR','SUPPORT_OFFICER','EMPLOYEE')")
    public DashboardResponseDTO getDashboard() {
        return dashboardService.getDashboardForCurrentUser();
    }
}
