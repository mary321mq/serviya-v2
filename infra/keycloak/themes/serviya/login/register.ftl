<#import "template.ftl" as layout>
<@layout.registrationLayout displayMessage=false displayInfo=false; section>
    <#if section = "header">
    <#elseif section = "form">
    <div class="serviya-login-container">
        <!-- Left Panel -->
        <div class="serviya-left-panel">
            <div class="serviya-left-content">
                <img src="${url.resourcesPath}/img/LOGO  1.png" alt="ServiYa Logo" class="serviya-logo">
                <h1 class="serviya-title">Únete a la<br>red de<br><span class="serviya-highlight">ServiYa</span></h1>
                <p class="serviya-subtitle">Regístrate gratis y obtén acceso<br>a cientos de servicios.</p>
                
                <ul class="serviya-features">
                    <li>
                        <div class="icon-circle">
                            <svg viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="3"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><polyline points="9 12 11 14 15 10"></polyline></svg>
                        </div>
                        <div class="feature-text">
                            <strong>Seguro</strong>
                            <span>Tus datos están protegidos<br>bajo los más altos estándares.</span>
                        </div>
                    </li>
                    <li>
                        <div class="icon-circle">
                            <svg viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" fill="#f59e0b"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
                        </div>
                        <div class="feature-text">
                            <strong>Rápido</strong>
                            <span>Crea tu cuenta en<br>cuestión de segundos.</span>
                        </div>
                    </li>
                </ul>
            </div>
            <!-- Background technician image -->
            <div class="serviya-technician-bg" style="background-image: url('${url.resourcesPath}/img/fonfo.png')"></div>
        </div>
        
        <!-- Right Panel (Form) -->
        <div class="serviya-right-panel" style="overflow-y: auto;">
            <div class="serviya-form-card register-card" style="margin: 20px 0;">
                <div class="form-header">
                    <h2>Registro de Usuario</h2>
                    <p>Completa tus datos para crear una cuenta</p>
                </div>

                <#if message?has_content && (message.type != 'warning' || !isAppInitiatedAction??)>
                    <div class="alert alert-${message.type}">
                        <span class="kc-feedback-text">${kcSanitize(message.summary)?no_esc}</span>
                    </div>
                </#if>

                <form id="kc-register-form" action="${url.registrationAction}" method="post">
                    <div class="form-row">
                        <div class="form-group">
                            <label for="firstName">Nombre</label>
                            <div class="input-wrapper">
                                <span class="input-icon">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                                </span>
                                <input type="text" id="firstName" class="form-control" name="firstName" value="${(register.formData.firstName!'')}" autocomplete="given-name" />
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="lastName">Apellidos</label>
                            <div class="input-wrapper">
                                <span class="input-icon">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                                </span>
                                <input type="text" id="lastName" class="form-control" name="lastName" value="${(register.formData.lastName!'')}" autocomplete="family-name" />
                            </div>
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="email">Correo electrónico</label>
                        <div class="input-wrapper">
                            <span class="input-icon">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                            </span>
                            <input type="email" id="email" class="form-control" name="email" value="${(register.formData.email!'')}" autocomplete="email" />
                        </div>
                    </div>

                    <#if !realm.registrationEmailAsUsername>
                    <div class="form-group">
                        <label for="username">Usuario</label>
                        <div class="input-wrapper">
                            <span class="input-icon">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path><path d="M2 12h20"></path></svg>
                            </span>
                            <input type="text" id="username" class="form-control" name="username" value="${(register.formData.username!'')}" autocomplete="username" />
                        </div>
                    </div>
                    </#if>

                    <#if passwordRequired??>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="password">Contraseña</label>
                            <div class="input-wrapper">
                                <span class="input-icon">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                                </span>
                                <input type="password" id="password" class="form-control" name="password" autocomplete="new-password" />
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="password-confirm">Confirmar Contraseña</label>
                            <div class="input-wrapper">
                                <span class="input-icon">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                                </span>
                                <input type="password" id="password-confirm" class="form-control" name="password-confirm" />
                            </div>
                        </div>
                    </div>
                    </#if>

                    <#if recaptchaRequired??>
                    <div class="form-group">
                        <div class="g-recaptcha" data-size="compact" data-sitekey="${recaptchaSiteKey}"></div>
                    </div>
                    </#if>

                    <div class="form-submit" style="margin-top: 24px;">
                        <button class="btn-primary" type="submit">Crear cuenta</button>
                    </div>

                    <div class="form-register">
                        <span>¿Ya tienes cuenta? <a href="${url.loginUrl}">Inicia sesión aquí</a></span>
                    </div>
                </form>
            </div>
            
            <div class="form-footer" style="position: relative; margin-top: 10px;">
                <p>Al registrarte, aceptas nuestros <br>
                <a href="#">Términos y condiciones</a> y <a href="#">Política de privacidad.</a></p>
            </div>
        </div>
    </div>
    </#if>
</@layout.registrationLayout>
