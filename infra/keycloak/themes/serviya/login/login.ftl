<#import "template.ftl" as layout>
<@layout.registrationLayout displayMessage=false displayInfo=false; section>
    <#if section = "header">
    <#elseif section = "form">
    <div class="serviya-login-container">
        <!-- Left Panel -->
        <div class="serviya-left-panel">
            <div class="serviya-left-content">
                <img src="${url.resourcesPath}/img/LOGO  1.png" alt="ServiYa Logo" class="serviya-logo">
                <h1 class="serviya-title">Conecta con<br>técnicos de<br><span class="serviya-highlight">confianza</span></h1>
                <p class="serviya-subtitle">Solicita, agenda y da seguimiento<br>a tus servicios en línea.</p>
                
                <ul class="serviya-features">
                    <li>
                        <div class="icon-circle">
                            <svg viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="3"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><polyline points="9 12 11 14 15 10"></polyline></svg>
                        </div>
                        <div class="feature-text">
                            <strong>Seguro</strong>
                            <span>Pagos protegidos y datos<br>siempre seguros.</span>
                        </div>
                    </li>
                    <li>
                        <div class="icon-circle">
                            <svg viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" fill="#f59e0b"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
                        </div>
                        <div class="feature-text">
                            <strong>Rápido</strong>
                            <span>Encuentra disponibilidad<br>y agenda en minutos.</span>
                        </div>
                    </li>
                    <li>
                        <div class="icon-circle">
                            <svg viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4" fill="#2563eb" stroke="none"></circle><path d="M16 11l2 2 4-4" stroke="#2563eb"></path></svg>
                        </div>
                        <div class="feature-text">
                            <strong>Técnicos verificados</strong>
                            <span>Profesionales calificados<br>y verificados.</span>
                        </div>
                    </li>
                </ul>
            </div>
            <!-- Background technician image -->
            <div class="serviya-technician-bg" style="background-image: url('${url.resourcesPath}/img/fonfo.png')"></div>
        </div>
        
        <!-- Right Panel (Form) -->
        <div class="serviya-right-panel">
            <div class="serviya-form-card">
                <div class="form-header">
                    <div class="user-avatar-icon">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    </div>
                    <h2>Iniciar sesión</h2>
                    <p>Accede a tu cuenta para continuar</p>
                </div>

                <#if message?has_content && (message.type != 'warning' || !isAppInitiatedAction??)>
                    <div class="alert alert-${message.type}">
                        <span class="kc-feedback-text">${kcSanitize(message.summary)?no_esc}</span>
                    </div>
                </#if>

                <form id="kc-form-login" onsubmit="login.disabled = true; return true;" action="${url.loginAction}" method="post">
                    <div class="form-group">
                        <label for="username">Correo electrónico</label>
                        <div class="input-wrapper">
                            <span class="input-icon">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                            </span>
                            <input tabindex="1" id="username" class="form-control" name="username" value="${(login.username!'')}" type="text" autofocus autocomplete="off" placeholder="ejemplo@correo.com" />
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="password">Contraseña</label>
                        <div class="input-wrapper">
                            <span class="input-icon">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                            </span>
                            <input tabindex="2" id="password" class="form-control" name="password" type="password" autocomplete="off" placeholder="Ingresa tu contraseña" />
                            <span class="input-icon-right" onclick="togglePassword()">
                                <svg id="eye-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                            </span>
                        </div>
                    </div>

                    <script>
                        function togglePassword() {
                            var x = document.getElementById("password");
                            var icon = document.getElementById("eye-icon");
                            if (x.type === "password") {
                                x.type = "text";
                                icon.innerHTML = '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line>';
                            } else {
                                x.type = "password";
                                icon.innerHTML = '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>';
                            }
                        }
                    </script>

                    <div class="form-options">
                        <div class="checkbox">
                            <label>
                                <#if login.rememberMe?? && login.rememberMe>
                                    <input tabindex="3" id="rememberMe" name="rememberMe" type="checkbox" checked> Recordarme
                                <#else>
                                    <input tabindex="3" id="rememberMe" name="rememberMe" type="checkbox"> Recordarme
                                </#if>
                            </label>
                        </div>
                        <div class="forgot-password">
                            <#if realm.resetPasswordAllowed>
                                <a tabindex="5" href="${url.loginResetCredentialsUrl}">¿Olvidaste tu contraseña?</a>
                            </#if>
                        </div>
                    </div>

                    <div class="form-submit">
                        <button tabindex="4" class="btn-primary" name="login" id="kc-login" type="submit">Iniciar sesión</button>
                    </div>
                    
                    <div class="divider">
                        <span>o continúa con</span>
                    </div>

                    <div class="social-login">
                        <button type="button" class="btn-google">
                            <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                            </svg>
                            Continuar con Google
                        </button>
                    </div>

                    <#if realm.password && realm.registrationAllowed && !registrationDisabled??>
                        <div class="form-register">
                            <span>¿No tienes cuenta? <a tabindex="6" href="${url.registrationUrl}">Regístrate</a></span>
                        </div>
                    </#if>
                </form>
            </div>
            
            <div class="form-footer">
                <p><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2" style="vertical-align: middle; margin-right: 4px; margin-top: -2px;"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg> Al iniciar sesión, aceptas nuestros <br>
                <a href="#">Términos de servicio</a> y <a href="#">Política de privacidad</a></p>
            </div>
        </div>
    </div>
    </#if>
</@layout.registrationLayout>
