package com.tbp.app;

import android.app.Activity;
import android.content.ContentResolver;
import android.content.ContentValues;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.provider.MediaStore;
import android.util.Base64;
import android.webkit.DownloadListener;
import android.webkit.JavascriptInterface;
import android.webkit.URLUtil;
import android.webkit.WebView;
import android.widget.Toast;

import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStream;

/**
 * WebView ignores {@code <a download>} for blob:/data: URLs. This listens for those downloads, reads the
 * bytes back out of the page (blob fetch -> base64), and writes them into the public Downloads folder.
 * Lives entirely in the native shell; the web app is untouched.
 */
final class NativeDownloadBridge {
    private static final String JS_NAME = "TbpNativeDownload";

    private NativeDownloadBridge() {}

    static void install(final Activity activity, final WebView webView) {
        webView.addJavascriptInterface(new Saver(activity), JS_NAME);
        webView.setDownloadListener(new DownloadListener() {
            @Override
            public void onDownloadStart(String url, String userAgent, String contentDisposition, String mimeType, long length) {
                String name = URLUtil.guessFileName(url, contentDisposition, mimeType);
                if (url.startsWith("blob:")) {
                    final String js = "(function(){fetch(" + quote(url) + ").then(function(r){return r.blob();})"
                        + ".then(function(b){var f=new FileReader();f.onloadend=function(){"
                        + JS_NAME + ".save(" + quote(name) + "," + quote(mimeType) + ",String(f.result).split(',')[1]||'');};"
                        + "f.readAsDataURL(b);});})();";
                    webView.post(new Runnable() {
                        @Override public void run() { webView.evaluateJavascript(js, null); }
                    });
                } else if (url.startsWith("data:")) {
                    int comma = url.indexOf(',');
                    if (comma > 0) {
                        boolean b64 = url.substring(0, comma).contains(";base64");
                        String data = url.substring(comma + 1);
                        byte[] bytes = b64
                            ? Base64.decode(data, Base64.DEFAULT)
                            : Uri.decode(data).getBytes(java.nio.charset.StandardCharsets.UTF_8);
                        new Saver(activity).write(name, mimeType, bytes);
                    }
                }
            }
        });
    }

    private static String quote(String value) {
        if (value == null) return "''";
        return "'" + value.replace("\\", "\\\\").replace("'", "\'").replace("\n", "") + "'";
    }

    static final class Saver {
        private final Activity activity;

        Saver(Activity activity) { this.activity = activity; }

        @JavascriptInterface
        public void save(String fileName, String mimeType, String base64) {
            write(fileName, mimeType, Base64.decode(base64, Base64.DEFAULT));
        }

        void write(String fileName, String mimeType, byte[] bytes) {
            String safeName = fileName == null || fileName.isEmpty() ? "download" : fileName.replaceAll("[\\/:*?\"<>|]", "_");
            String type = mimeType == null || mimeType.isEmpty() ? "application/octet-stream" : mimeType;
            boolean ok = false;
            try {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                    ContentResolver resolver = activity.getContentResolver();
                    ContentValues values = new ContentValues();
                    values.put(MediaStore.Downloads.DISPLAY_NAME, safeName);
                    values.put(MediaStore.Downloads.MIME_TYPE, type);
                    values.put(MediaStore.Downloads.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS);
                    Uri uri = resolver.insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, values);
                    if (uri != null) {
                        try (OutputStream out = resolver.openOutputStream(uri)) {
                            if (out != null) { out.write(bytes); ok = true; }
                        }
                    }
                } else {
                    File dir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS);
                    if (!dir.exists()) dir.mkdirs();
                    try (OutputStream out = new FileOutputStream(new File(dir, safeName))) {
                        out.write(bytes);
                        ok = true;
                    }
                }
            } catch (Exception ignored) {
                ok = false;
            }
            final String message = ok ? "Saved to Downloads: " + safeName : "Could not save " + safeName;
            activity.runOnUiThread(new Runnable() {
                @Override public void run() { Toast.makeText(activity, message, Toast.LENGTH_LONG).show(); }
            });
        }
    }
}
