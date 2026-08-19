package com.example.helpdesk.service;

import com.example.helpdesk.dto.DashboardResponseDTO;

public interface DashboardService {
    DashboardResponseDTO getDashboardForCurrentUser();
}
