package com.serviya.testing;

import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.classes;
import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noClasses;

import com.tngtech.archunit.core.domain.JavaModifier;
import com.tngtech.archunit.junit.ArchTest;
import com.tngtech.archunit.lang.ArchRule;

public class ArchitectureRules {

  @ArchTest
  public static final ArchRule domain_should_not_depend_on_infrastructure_or_api =
      noClasses()
          .that()
          .resideInAPackage("..domain..")
          .should()
          .dependOnClassesThat()
          .resideInAnyPackage("..infrastructure..", "..api..")
          .because("Domain layer should be independent of infrastructure and delivery details.");

  @ArchTest
  public static final ArchRule domain_should_not_depend_on_spring_or_jpa =
      noClasses()
          .that()
          .resideInAPackage("..domain..")
          .should()
          .dependOnClassesThat()
          .resideInAnyPackage(
              "org.springframework..", "jakarta.persistence..", "javax.persistence..")
          .because("Domain layer should not contain frameworks or ORM specifics.");

  @ArchTest
  public static final ArchRule application_should_not_depend_on_infrastructure =
      noClasses()
          .that()
          .resideInAPackage("..application..")
          .should()
          .dependOnClassesThat()
          .resideInAPackage("..infrastructure..")
          .because(
              "Application layer can only use infrastructure through interfaces (ports) defined in domain or application.");

  @ArchTest
  public static final ArchRule api_should_not_access_repositories_directly =
      noClasses()
          .that()
          .resideInAPackage("..api..")
          .should()
          .dependOnClassesThat()
          .haveSimpleNameEndingWith("Repository")
          .because("API layer should interact through Application services or Use Cases.");

  @ArchTest
  public static final ArchRule interfaces_should_not_have_public_modifier =
      classes()
          .that()
          .areInterfaces()
          .should()
          .notHaveModifier(JavaModifier.PUBLIC)
          .orShould()
          .bePublic()
          .because("Avoid unnecessary modifiers."); // Simple sanity check rule
}
