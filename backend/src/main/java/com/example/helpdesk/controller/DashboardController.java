package com.example.helpdesk.controller;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
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

    @GetMapping(value = "/report", produces = MediaType.APPLICATION_PDF_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN','SUPERVISOR')")
    public ResponseEntity<byte[]> exportReport() {
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=helpdesk-ticket-report.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(dashboardService.generatePdfReportForCurrentUser());
    }
}
