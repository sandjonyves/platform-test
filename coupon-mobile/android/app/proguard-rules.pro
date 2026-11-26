# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Add any project specific keep options here:

# --- React Native ---
-keep,allowobfuscation @interface com.facebook.proguard.annotations.DoNotStrip
-keep,allowobfuscation @interface com.facebook.proguard.annotations.KeepGettersAndSetters
-keep @com.facebook.proguard.annotations.DoNotStrip class *
-keepclassmembers class * {
    @com.facebook.proguard.annotations.DoNotStrip *;
}
-keepclassmembers @com.facebook.proguard.annotations.KeepGettersAndSetters class * {
    void set*(***);
    *** get*();
}
-keep class com.facebook.react.turbomodule.** { *; }
-keep class com.facebook.jni.** { *; }

# --- Hermes ---
-keep class com.facebook.hermes.unicode.** { *; }

# --- Firebase / Google Play Services ---
-keep class com.google.firebase.** { *; }
-keep class com.google.android.gms.** { *; }
-dontwarn com.google.firebase.**
-dontwarn com.google.android.gms.**

# --- Notifee ---
-keep class io.invertase.notifee.** { *; }
-keep class app.notifee.** { *; }

# --- react-native-vector-icons ---
-keep class com.oblador.vectoricons.** { *; }

# --- OkHttp (réseau) ---
-dontwarn okhttp3.**
-dontwarn okio.**

# Garder les noms de fichiers/lignes pour les stack traces
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile
