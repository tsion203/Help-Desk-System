package com.example.helpdesk.security;

import java.io.IOException;
import java.util.List;
import java.util.stream.Stream;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {
    private static final Logger LOGGER = LoggerFactory.getLogger(JwtAuthFilter.class);

    private final JwtUtil jwtUtil;
    private final UserDetailsServiceImpl userDetailsService;
    private final ApiErrorWriter errorWriter;

    public JwtAuthFilter(JwtUtil jwtUtil, UserDetailsServiceImpl userDetailsService, ApiErrorWriter errorWriter) {
        this.jwtUtil = jwtUtil;
        this.userDetailsService = userDetailsService;
        this.errorWriter = errorWriter;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        final String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            final String token = authHeader.substring(7);
            final String username = jwtUtil.extractUsername(token);

            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails userDetails = userDetailsService.loadUserByUsername(username);

                if (!jwtUtil.isTokenValid(token, userDetails.getUsername())) {
                    errorWriter.write(request, response, HttpServletResponse.SC_UNAUTHORIZED,
                            "SESSION_EXPIRED", "Your session has expired. Please sign in again.");
                    return;
                }
                List<SimpleGrantedAuthority> authorities = Stream.concat(
                                jwtUtil.extractRoles(token).stream(),
                                userDetails.getAuthorities().stream().map(authority -> authority.getAuthority()))
                        .filter(role -> role != null && !role.isBlank())
                        .map(this::normalizeRole)
                        .distinct()
                        .map(SimpleGrantedAuthority::new)
                        .toList();
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null,
                        authorities
                );
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        } catch (UsernameNotFoundException | io.jsonwebtoken.JwtException | IllegalArgumentException ex) {
            LOGGER.warn("JWT authentication failed for {} {}", request.getMethod(), request.getRequestURI(), ex);
            SecurityContextHolder.clearContext();
            errorWriter.write(request, response, HttpServletResponse.SC_UNAUTHORIZED,
                    "SESSION_EXPIRED", "Your session has expired. Please sign in again.");
            return;
        }

        filterChain.doFilter(request, response);
    }

    private String normalizeRole(String role) {
        String normalized = role.trim().toUpperCase();
        return normalized.startsWith("ROLE_") ? normalized : "ROLE_" + normalized;
    }
}
