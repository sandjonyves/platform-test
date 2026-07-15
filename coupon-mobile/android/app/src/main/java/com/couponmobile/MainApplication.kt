package com.couponmobile

import android.app.Application
import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.os.Build
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeApplicationEntryPoint.loadReactNative
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost

class MainApplication : Application(), ReactApplication {

  override val reactHost: ReactHost by lazy {
    getDefaultReactHost(
      context = applicationContext,
      packageList =
        PackageList(this).packages.apply {
          // Packages that cannot be autolinked yet can be added manually here, for example:
          // add(MyReactNativePackage())
        },
    )
  }

  override fun onCreate() {
    super.onCreate()
    createNotificationChannel()
    loadReactNative(this)
  }

  private fun createNotificationChannel() {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      val manager = getSystemService(NotificationManager::class.java) ?: return

      // Supprimer les anciens canaux (Android ne met pas à jour importance/visibilité)
      listOf("coupons_v3", "coupons_v4").forEach { id ->
        try {
          manager.deleteNotificationChannel(id)
        } catch (_: Exception) {
        }
      }

      val channel = NotificationChannel(
        "coupons_v5",
        "Coupons",
        NotificationManager.IMPORTANCE_HIGH
      ).apply {
        description = "Notifications pour les nouveaux coupons (écran de verrouillage)"
        enableVibration(true)
        vibrationPattern = longArrayOf(0, 250, 200, 250)
        enableLights(true)
        setShowBadge(true)
        lockscreenVisibility = Notification.VISIBILITY_PUBLIC
        setBypassDnd(false)
      }
      manager.createNotificationChannel(channel)
    }
  }
}
