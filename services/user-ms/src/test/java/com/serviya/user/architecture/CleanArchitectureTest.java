package com.serviya.user.architecture;

import com.serviya.testing.ArchitectureRules;
import com.tngtech.archunit.junit.AnalyzeClasses;
import com.tngtech.archunit.junit.ArchTest;
import com.tngtech.archunit.junit.ArchTests;

@AnalyzeClasses(packages = "com.serviya.user")
public class CleanArchitectureTest {
  @ArchTest static final ArchTests cleanArchitectureRules = ArchTests.in(ArchitectureRules.class);
}
