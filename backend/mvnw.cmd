@echo off
REM ----------------------------------------------------------------------------
REM Maven Wrapper
REM ----------------------------------------------------------------------------
set MAVEN_PROJECTBASEDIR=%~dp0
set MAVEN_PROJECTBASEDIR_NO_SLASH=%MAVEN_PROJECTBASEDIR:~0,-1%
set WRAPPER_DIR=%MAVEN_PROJECTBASEDIR%.mvn\wrapper
set WRAPPER_JAR=%WRAPPER_DIR%\maven-wrapper.jar
set PROPERTIES_FILE=%WRAPPER_DIR%\maven-wrapper.properties
if not exist "%WRAPPER_JAR%" (
  echo Maven Wrapper jar not found. Please download or generate it first.
  exit /b 1
)
if defined JAVA_HOME (
  set JAVA_EXEC=%JAVA_HOME%\bin\java.exe
) else (
  set JAVA_EXEC=java
)
"%JAVA_EXEC%" "-Dmaven.multiModuleProjectDirectory=%MAVEN_PROJECTBASEDIR_NO_SLASH%" -cp "%WRAPPER_JAR%" org.apache.maven.wrapper.MavenWrapperMain %*
