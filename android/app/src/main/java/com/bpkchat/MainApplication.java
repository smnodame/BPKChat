package com.bpkchat;

import android.app.Application;

import com.facebook.react.ReactApplication;
<<<<<<< HEAD
import com.futurice.rctaudiotoolkit.AudioPackage;
=======
import com.zxcpoiu.incallmanager.InCallManagerPackage;
import com.oney.WebRTCModule.WebRTCModulePackage;
import com.zmxv.RNSound.RNSoundPackage;
import com.rnim.rn.audio.ReactNativeAudioPackage;
>>>>>>> release@0.2
import com.filepicker.FilePickerPackage;
import com.wix.reactnativenotifications.RNNotificationsPackage;
import com.meedan.ShareMenuPackage;
import com.RNFetchBlob.RNFetchBlobPackage;
import com.imagepicker.ImagePickerPackage;
import com.oblador.vectoricons.VectorIconsPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;

import java.util.Arrays;
import java.util.List;

public class MainApplication extends Application implements ReactApplication {

  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
    @Override
    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
          new MainReactPackage(),
<<<<<<< HEAD
            new AudioPackage(),
=======
            new InCallManagerPackage(),
            new WebRTCModulePackage(),
            new RNSoundPackage(),
            new ReactNativeAudioPackage(),
>>>>>>> release@0.2
            new FilePickerPackage(),
            new RNNotificationsPackage(MainApplication.this),
            new ShareMenuPackage(),
            new RNFetchBlobPackage(),
            new ImagePickerPackage(),
            new VectorIconsPackage()
      );
    }

    @Override
    protected String getJSMainModuleName() {
      return "index";
    }
  };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    SoLoader.init(this, /* native exopackage */ false);
  }
}
