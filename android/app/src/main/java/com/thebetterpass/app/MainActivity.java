package com.thebetterpass.app;

import com.getcapacitor.BridgeActivity;
import com.ionicframework.capacitor.Checkout;

import android.os.Bundle;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        registerPlugin(Checkout.class);
        // Native-only: lets in-page "download" links (map image, CSV exports) save real files.
        NativeDownloadBridge.install(this, getBridge().getWebView());
    }
}
