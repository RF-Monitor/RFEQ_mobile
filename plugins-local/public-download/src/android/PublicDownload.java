package com.rptes.publicdownload;

import android.content.ContentResolver;
import android.content.ContentValues;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.provider.MediaStore;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.json.JSONArray;
import org.json.JSONException;

import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;

public class PublicDownload extends CordovaPlugin {
    @Override
    public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {
        if(!"download".equals(action)){
            return false;
        }

        String url = args.getString(0);
        String filename = args.getString(1);
        String loginKey = args.optString(2, "");

        if(Build.VERSION.SDK_INT < Build.VERSION_CODES.Q){
            callbackContext.error("公開 Download 寫入功能需要 Android 10 以上");
            return true;
        }

        cordova.getThreadPool().execute(() -> download(url, filename, loginKey, callbackContext));
        return true;
    }

    private void download(String urlString, String filename, String loginKey, CallbackContext callbackContext){
        ContentResolver resolver = cordova.getActivity().getContentResolver();
        Uri fileUri = null;
        HttpURLConnection connection = null;

        try{
            ContentValues values = new ContentValues();
            values.put(MediaStore.MediaColumns.DISPLAY_NAME, filename);
            values.put(MediaStore.MediaColumns.MIME_TYPE, "image/png");
            values.put(MediaStore.MediaColumns.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS);
            values.put(MediaStore.MediaColumns.IS_PENDING, 1);

            fileUri = resolver.insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, values);
            if(fileUri == null){
                throw new Exception("無法建立下載檔案");
            }

            connection = (HttpURLConnection)new URL(urlString).openConnection();
            connection.setRequestMethod("GET");
            connection.setConnectTimeout(15000);
            connection.setReadTimeout(60000);

            if(loginKey != null && !loginKey.isEmpty()){
                connection.setRequestProperty("x-login-key", loginKey);
            }

            int status = connection.getResponseCode();
            if(status < 200 || status >= 300){
                throw new Exception("HTTP error! status: " + status);
            }

            try(InputStream input = connection.getInputStream();
                OutputStream output = resolver.openOutputStream(fileUri)){
                if(output == null){
                    throw new Exception("無法開啟下載檔案");
                }

                byte[] buffer = new byte[8192];
                int count;

                while((count = input.read(buffer)) != -1){
                    output.write(buffer, 0, count);
                }

                output.flush();
            }

            ContentValues completedValues = new ContentValues();
            completedValues.put(MediaStore.MediaColumns.IS_PENDING, 0);
            resolver.update(fileUri, completedValues, null, null);

            callbackContext.success("Download/" + filename);
        }catch(Exception error){
            if(fileUri != null){
                resolver.delete(fileUri, null, null);
            }

            callbackContext.error(error.getMessage());
        }finally{
            if(connection != null){
                connection.disconnect();
            }
        }
    }
}