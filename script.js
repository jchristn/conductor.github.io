/* ============================================================
   Conductor Marketing Website - JavaScript
   Concert Hall Redesign
   ============================================================ */

(function () {
    'use strict';

    // --- Theme Toggle ---
    var themeToggle = document.getElementById('themeToggle');
    var html = document.documentElement;

    function getPreferredTheme() {
        var stored = localStorage.getItem('conductor-theme');
        if (stored) return stored;
        return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    }

    function setTheme(theme) {
        html.setAttribute('data-theme', theme);
        localStorage.setItem('conductor-theme', theme);
    }

    setTheme(getPreferredTheme());

    themeToggle.addEventListener('click', function () {
        var current = html.getAttribute('data-theme');
        setTheme(current === 'dark' ? 'light' : 'dark');
    });

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
        if (!localStorage.getItem('conductor-theme')) {
            setTheme(e.matches ? 'dark' : 'light');
        }
    });

    // --- Mobile Navigation ---
    var hamburger = document.getElementById('hamburger');
    var navLinks = document.getElementById('navLinks');

    hamburger.addEventListener('click', function () {
        navLinks.classList.toggle('open');
        hamburger.classList.toggle('active');
    });

    navLinks.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', function () {
            navLinks.classList.remove('open');
            hamburger.classList.remove('active');
        });
    });

    document.addEventListener('click', function (e) {
        if (!e.target.closest('.nav-inner')) {
            navLinks.classList.remove('open');
            hamburger.classList.remove('active');
        }
    });

    // --- Copy to Clipboard ---
    document.querySelectorAll('.copy-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var codeBlock = btn.closest('.code-block');
            var code = codeBlock.querySelector('pre').textContent;

            navigator.clipboard.writeText(code).then(function () {
                btn.classList.add('copied');
                btn.querySelector('span').textContent = 'Copied!';
                setTimeout(function () {
                    btn.classList.remove('copied');
                    btn.querySelector('span').textContent = 'Copy';
                }, 2000);
            });
        });
    });

    // --- Scroll-based Nav Background ---
    var nav = document.getElementById('nav');

    window.addEventListener('scroll', function () {
        if (window.scrollY > 20) {
            nav.style.borderBottomColor = 'var(--border)';
        } else {
            nav.style.borderBottomColor = 'transparent';
        }
    }, { passive: true });

    // --- Active Nav Highlighting ---
    var sections = document.querySelectorAll('section[id]');
    var navAnchors = document.querySelectorAll('.nav-links a');

    function updateActiveNav() {
        var scrollPos = window.scrollY + 120;

        sections.forEach(function (section) {
            var top = section.offsetTop;
            var bottom = top + section.offsetHeight;
            var id = section.getAttribute('id');

            if (scrollPos >= top && scrollPos < bottom) {
                navAnchors.forEach(function (a) {
                    a.classList.remove('active');
                    if (a.getAttribute('href') === '#' + id) {
                        a.classList.add('active');
                    }
                });
            }
        });
    }

    window.addEventListener('scroll', updateActiveNav, { passive: true });
    updateActiveNav();

    // --- Hero SVG Particle Animation ---
    // Animate particles along the routing paths
    function animateParticles() {
        var routeInPaths = document.querySelectorAll('.route-in');
        var routeOutPaths = document.querySelectorAll('.route-out');
        var particles = document.querySelectorAll('.particle');

        if (routeInPaths.length < 3 || routeOutPaths.length < 3 || particles.length < 6) return;

        // Map particles to paths: 1-3 on in-paths, 4-6 on out-paths
        var pathPairs = [
            { particle: particles[0], path: routeInPaths[0] },
            { particle: particles[1], path: routeInPaths[1] },
            { particle: particles[2], path: routeInPaths[2] },
            { particle: particles[3], path: routeOutPaths[0] },
            { particle: particles[4], path: routeOutPaths[1] },
            { particle: particles[5], path: routeOutPaths[2] }
        ];

        pathPairs.forEach(function (pair) {
            var pathLength = pair.path.getTotalLength();
            var duration = 3000 + Math.random() * 2000;
            var startDelay = Math.random() * 3000;

            function moveParticle() {
                var start = null;

                function step(timestamp) {
                    if (!start) start = timestamp;
                    var elapsed = timestamp - start;
                    var progress = (elapsed % duration) / duration;

                    var point = pair.path.getPointAtLength(progress * pathLength);
                    pair.particle.setAttribute('cx', point.x);
                    pair.particle.setAttribute('cy', point.y);

                    // Fade in/out
                    var opacity = 0;
                    if (progress < 0.1) opacity = progress / 0.1;
                    else if (progress > 0.9) opacity = (1 - progress) / 0.1;
                    else opacity = 1;
                    pair.particle.style.opacity = opacity * 0.7;

                    requestAnimationFrame(step);
                }

                setTimeout(function () {
                    requestAnimationFrame(step);
                }, startDelay);
            }

            moveParticle();
        });
    }

    // Start particle animation after route lines have drawn
    setTimeout(animateParticles, 2500);

    // --- Endpoint Dimming Animation ---
    // Periodically dim one endpoint node and brighten it back
    function setupEndpointDimming() {
        var endpoints = document.querySelectorAll('.endpoint-node');
        var outPaths = document.querySelectorAll('.route-out');
        if (endpoints.length < 3 || outPaths.length < 3) return;

        var currentDim = -1;

        function dimCycle() {
            // Restore previous
            if (currentDim >= 0) {
                endpoints[currentDim].style.opacity = '0.7';
                endpoints[currentDim].style.transition = 'opacity 0.5s ease';
                outPaths[currentDim].style.opacity = '0.4';
                outPaths[currentDim].style.transition = 'opacity 0.5s ease';
            }

            // Pick a new one to dim
            var next;
            do {
                next = Math.floor(Math.random() * 3);
            } while (next === currentDim);
            currentDim = next;

            endpoints[currentDim].style.opacity = '0.15';
            endpoints[currentDim].style.transition = 'opacity 0.8s ease';
            outPaths[currentDim].style.opacity = '0.1';
            outPaths[currentDim].style.transition = 'opacity 0.8s ease';

            // Restore after 2 seconds
            setTimeout(function () {
                endpoints[currentDim].style.opacity = '0.7';
                outPaths[currentDim].style.opacity = '0.4';
            }, 2000);
        }

        setInterval(dimCycle, 5000);
    }

    setTimeout(setupEndpointDimming, 4000);

    // --- Intersection Observer: Score Flow ---
    var scoreFlow = document.getElementById('scoreFlow');
    if (scoreFlow && 'IntersectionObserver' in window) {
        var scoreObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    scoreObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 });
        scoreObserver.observe(scoreFlow);
    }

    // --- Intersection Observer: Feature Pills (stagger fade-in) ---
    var pills = document.querySelectorAll('.pill');
    if (pills.length > 0 && 'IntersectionObserver' in window) {
        var pillObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    // Find all pills in the same parent group
                    var group = entry.target.closest('.setlist-pills');
                    if (group) {
                        var groupPills = group.querySelectorAll('.pill');
                        groupPills.forEach(function (pill, index) {
                            setTimeout(function () {
                                pill.classList.add('animate-in');
                            }, index * 60);
                        });
                    }
                    pillObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        // Observe the first pill in each group
        document.querySelectorAll('.setlist-pills').forEach(function (group) {
            var firstPill = group.querySelector('.pill');
            if (firstPill) pillObserver.observe(firstPill);
        });
    }

    // --- Intersection Observer: Timeline Gold Line ---
    var timelineLine = document.getElementById('timelineLine');
    if (timelineLine && 'IntersectionObserver' in window) {
        var timelineObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');

                    // Activate timeline steps sequentially
                    var steps = document.querySelectorAll('.timeline-step');
                    steps.forEach(function (step, index) {
                        setTimeout(function () {
                            step.classList.add('active');
                        }, (index + 1) * 400);
                    });

                    timelineObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        timelineObserver.observe(timelineLine);
    }

    // --- General Scroll Animation for cards/blocks ---
    var animateElements = document.querySelectorAll(
        '.problem-card, .score-card, .repertoire-block, .health-item, .setlist-group'
    );

    if (animateElements.length > 0 && 'IntersectionObserver' in window) {
        var generalObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    generalObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -40px 0px'
        });

        animateElements.forEach(function (el) {
            el.classList.add('animate-target');
            generalObserver.observe(el);
        });
    }

    // --- Health Indicator Animation ---
    // Toggle the red health dot between "Rerouting..." and "Recovered"
    var healthRedDot = document.getElementById('healthRedDot');
    var healthRedStatus = document.getElementById('healthRedStatus');

    if (healthRedDot && healthRedStatus) {
        var isDown = true;

        setInterval(function () {
            isDown = !isDown;
            if (isDown) {
                healthRedDot.className = 'health-dot health-red';
                healthRedStatus.textContent = 'Rerouting...';
                healthRedStatus.className = 'health-status health-status-red';
            } else {
                healthRedDot.className = 'health-dot health-green';
                healthRedStatus.textContent = 'Recovered';
                healthRedStatus.className = 'health-status';
            }
        }, 3000);
    }
})();
