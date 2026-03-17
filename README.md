🐳
Docker Production App
Technical Project Report
A Complete Production-Grade Container Architecture

8 Phases
Completed
32 Concepts
Implemented
6 Services
Running Live

Submitted by: Muhammad Haseeb Farrukh   |   Platform: AWS EC2 M7 Large   |   GitHub: haseebfarrukh42

1.  What Is This Project?
This project is a fully working, production-style web application built and deployed entirely using Docker on an AWS cloud server. It was built to learn and demonstrate real-world DevOps skills — not just theory, but hands-on implementation of every concept.

Think of it like this:

Analogy
In This Project
A restaurant
The full application — multiple parts working together
The front door
Nginx — the gateway that receives all visitors
The waiter
Frontend — what users see and interact with
The kitchen
Backend + API — where the real work happens
The storage room
PostgreSQL database — where all data is saved
The quick shelf
Redis cache — stores frequently used data for speed

Every part runs in its own isolated Docker container. All containers are connected, managed, and deployed as one system on a single AWS server.

2.  The Infrastructure
2.1  Server Specification
Component
Detail
Cloud Provider
Amazon Web Services (AWS)
Server Type
EC2 M7 Large
CPU
2 vCPUs
RAM
8 GB
Storage
30 GB SSD Volume
Operating System
Ubuntu 24 LTS
Public Access
HTTP (port 80) and HTTPS (port 443) only
Code Repository
GitHub — github.com/haseebfarrukh42/docker-production-app

2.2  System Architecture
All internet traffic enters through Nginx only. No other service is directly reachable from the internet. This is how real production systems are designed.

Internet (User's Browser)
        |
        v
[ Nginx Gateway  :80 / :443 ]   ← Only door in
   |              |           |
   v              v           v
[ Frontend ]  [ Backend ]  [ API Service ]
  React         Node.js      Python FastAPI
                  |              |
           [ PostgreSQL ]   [ Redis ]
             Database         Cache

2.3  All Six Services
Service
Technology
Role
Key Responsibility
nginx
Nginx 1.25
Gateway
Receives all traffic, routes to correct service, handles SSL
frontend
React + Nginx
UI
The visual interface users see in their browser
backend
Node.js 18
API Server
Handles business logic, talks to the database
api-service
Python FastAPI
Microservice
Second API layer with Redis caching for performance
postgres
PostgreSQL 15
Database
Stores all application data permanently
redis
Redis 7
Cache
Stores frequently requested data in memory for speed

3.  What Was Built — 8 Phases
The project was built phase by phase. Each phase added new production features on top of the previous one. Every phase is part of the same system — nothing was thrown away and restarted.

#
Phase
What Was Done
1
Foundation
Installed Docker on AWS EC2. Learned what Docker is, why it exists, and set up the project folder structure that all 8 phases would build on.
2
Core Stack
Built all 5 application containers. Used multi-stage Docker builds to make images small and efficient. Connected services using Docker networking.
3
Config & Secrets
Moved all passwords out of the code into a secure .env file and Docker Secrets. Set up data persistence so the database never loses data on restart.
4
Networking & Nginx
Added Nginx as a reverse proxy gateway. Configured SSL certificates for HTTPS. Set up routing rules so Nginx sends requests to the right service. Split into two networks for security.
5
Reliability
Added health checks to every service so Docker knows when each one is truly ready. Set resource limits so no single container can crash the whole server. Configured automatic restart on failure.
6
Dev Workflow
Set up live code reloading so code changes appear instantly without rebuilding. Added migration scripts, seed scripts, and test runners using Docker Compose profiles.
7
Observability
Scaled services to 3 instances with Nginx load balancing traffic between them. Added structured JSON logging with automatic log rotation. Built a debugging toolkit.
8
Automation & CI/CD
Created a Makefile with 30+ one-command shortcuts. Built a GitHub Actions pipeline that automatically builds, tests, and deploys on every code push. Introduced Docker Swarm for multi-server production.

4.  Key Technical Achievements
4.1  Security
    • No passwords are hardcoded anywhere in the codebase.
    • All credentials stored in Docker Secrets — not visible even with docker inspect.
    • Only two ports open to the internet: 80 (HTTP) and 443 (HTTPS).
    • Database and cache are on a private network — completely unreachable from outside.
    • HTTP traffic automatically redirects to HTTPS. Enforces encrypted connections.
    • SSL/TLS with modern protocols only (TLS 1.2 and 1.3). Old insecure versions blocked.
    • All containers run as non-root users. A security best practice.

4.2  Reliability
    • Health checks run every 30 seconds on every service.
    • Services start in the correct order — backend waits for database to be truly ready.
    • If any container crashes, Docker automatically restarts it.
    • EC2 server reboot: all containers come back up automatically, no manual action needed.
    • Resource limits set per container — one misbehaving service cannot crash the others.
    • Database data survives container restarts, rebuilds, and server reboots via Docker Volumes.

4.3  Performance
    • Multi-stage builds: React app image is 25MB instead of 1.2GB (98% smaller).
    • Redis caching: repeated API requests return in under 1ms instead of 500ms.
    • Horizontal scaling: backend and API can scale to 3+ instances with one command.
    • Nginx load balancing distributes traffic evenly across all scaled instances.
    • Gzip compression enabled on Nginx — reduces data transferred to browsers.
    • HTTP/2 enabled — multiple requests in parallel, faster page loads.

4.4  Developer Experience
    • Live code reloading — change a file and see it in under 1 second, no rebuild.
    • make up starts the entire 6-service stack with one command.
    • make migrate, make seed, make test run in isolated containers.
    • make help shows all 30+ available commands with descriptions.
    • Separate dev and production configurations — same codebase, different behaviour.

5.  Automated CI/CD Pipeline
A GitHub Actions pipeline was built that runs automatically on every code push. This is how professional engineering teams ship software safely.

Step
Job
What It Does Automatically
1
Validate
Checks all configuration files are valid. Verifies no secrets are hardcoded. Runs in under 30 seconds.
2
Build
Builds all Docker images. Uses layer caching to make repeat builds fast. Reports image sizes.
3
Test
Starts the full 6-container stack. Runs health checks on every endpoint. Runs integration tests. Tears down the environment after.
4
Deploy
Only runs on the main branch. SSH connects to EC2. Pulls latest code. Starts production stack. Verifies deployment is healthy.

Result: A developer pushes code to GitHub → within 5 minutes, the change is validated, tested, and live on the production server. Zero manual steps.

6.  What Can Be Managed Through This System
The system comes with a Makefile — a menu of commands that control every aspect of the application. Anyone on the team can manage the system without knowing Docker deeply.

Category
Command
What It Does
Start / Stop
make up
Start the entire application stack
Start / Stop
make down
Stop everything (data is preserved)
Start / Stop
make fresh
Wipe everything and start clean
Production
make prod-up
Start in production mode
Database
make migrate
Apply database schema changes
Database
make seed
Fill database with test data
Database
make db-backup
Backup all data to a file
Database
make db-restore
Restore data from backup file
Monitoring
make status
See health of all 6 containers
Monitoring
make health
Test all web endpoints are responding
Monitoring
make logs
Watch live logs from all services
Monitoring
make stats
See CPU and memory usage per container
Scaling
make scale-up
Run 3 instances of backend and API
Scaling
make scale-down
Return to single instances
Testing
make test
Run integration test suite
Maintenance
make clean
Remove unused Docker resources
Maintenance
make nginx-reload
Apply Nginx config changes live

7.  Real-World Debugging Experience
During the project, real production-style failures were encountered and resolved. This is the most valuable hands-on experience — diagnosing and fixing live system problems.

Problem Encountered
Root Cause
Lesson Learned
Frontend container unhealthy — connection refused
Alpine Linux resolves 'localhost' to IPv6. Nginx only listened on IPv4.
Always use 127.0.0.1 in health checks, not 'localhost'.
Backend crashed silently on startup
server.js required logger.js but that file did not exist on disk.
Every file a module requires must exist on the host before building the image.
Backend health check returning 503 error
DB_USER and DB_PASSWORD were only in secrets, not in environment variables.
Always provide env var fallbacks alongside Docker Secrets.

Each issue was diagnosed using the systematic 5-step method: check container status → read health check output → exec into container → check connectivity → check configuration.

8.  Skills Demonstrated
Docker & Containers
Infrastructure & Cloud
Engineering Practices
Docker images and containers
AWS EC2 deployment
Git and GitHub
Multi-stage Dockerfiles
Security group configuration
GitHub Actions CI/CD
Docker Compose V2
Nginx reverse proxy
Environment separation
Docker networking
SSL/TLS certificates
Structured JSON logging
Named volumes and bind mounts
Load balancing
Production debugging
Docker Secrets
Network segmentation
Makefile automation
Health checks and dependencies
PostgreSQL on Linux
Secret management
Resource limits and scaling
Redis caching patterns
Database migrations
Docker Swarm concepts
Server hardening basics
Multi-language stack

9.  Summary
What was built:
A complete, production-style web application running on AWS EC2. Six Docker containers. Two networks. Automated deployment. SSL encryption. Real-world security practices.

What was learned:
32 Docker concepts across 8 phases. Not just commands — the reasoning behind every decision. How production systems are designed, operated, debugged, and automated.

What makes it production-grade:
The same patterns used here — health checks, secrets management, network segmentation, CI/CD pipelines, structured logging, and horizontal scaling — are the same patterns used by engineering teams at real companies running real products.

GitHub Repository
github.com/haseebfarrukh42/
docker-production-app
Live Server
AWS EC2 M7 Large
Ubuntu 24 LTS
Tech Stack
Docker · Nginx · React
Node.js · Python · PostgreSQL


Muhammad Haseeb Farrukh  ·  haseebfarrukh42@gmail.com  ·  github.com/haseebfarrukh42
