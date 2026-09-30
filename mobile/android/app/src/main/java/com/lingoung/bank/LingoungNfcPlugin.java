package com.lingoung.bank;

import android.app.Activity;
import android.content.ComponentName;
import android.content.pm.PackageManager;
import android.nfc.NfcAdapter;
import android.nfc.Tag;
import android.nfc.tech.IsoDep;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "LingoungNfc")
public class LingoungNfcPlugin extends Plugin {
    private static final byte[] SELECT_AID = hex("00A4040007F001020304050600");
    private static final byte[] GET_TOKEN = hex("80CA000000");
    private PluginCall pendingRead;

    @PluginMethod
    public void getStatus(PluginCall call) {
        NfcAdapter adapter = NfcAdapter.getDefaultAdapter(getContext());
        JSObject result = new JSObject();
        result.put("supported", adapter != null);
        result.put("enabled", adapter != null && adapter.isEnabled());
        call.resolve(result);
    }

    @PluginMethod
    public void runDiagnostics(PluginCall call) {
        NfcAdapter adapter = NfcAdapter.getDefaultAdapter(getContext());
        PackageManager packageManager = getContext().getPackageManager();
        boolean serviceDeclared;
        try {
            packageManager.getServiceInfo(
                new ComponentName(getContext(), LingoungHostApduService.class),
                PackageManager.GET_META_DATA
            );
            serviceDeclared = true;
        } catch (PackageManager.NameNotFoundException error) {
            serviceDeclared = false;
        }

        JSObject result = new JSObject();
        result.put("nativeBridge", true);
        result.put("nfcSupported", adapter != null);
        result.put("nfcEnabled", adapter != null && adapter.isEnabled());
        result.put(
            "hceSupported",
            packageManager.hasSystemFeature(PackageManager.FEATURE_NFC_HOST_CARD_EMULATION)
        );
        result.put("hceServiceDeclared", serviceDeclared);
        result.put(
            "paymentTokenLoaded",
            !getContext().getSharedPreferences("lingoung_nfc", Activity.MODE_PRIVATE)
                .getString("payment_token", "")
                .isEmpty()
        );
        call.resolve(result);
    }

    @PluginMethod
    public void startCardEmulation(PluginCall call) {
        String token = call.getString("token", "");
        if (token.isEmpty()) {
            call.reject("Payment token is required");
            return;
        }
        getContext().getSharedPreferences("lingoung_nfc", Activity.MODE_PRIVATE)
            .edit().putString("payment_token", token).apply();
        call.resolve();
    }

    @PluginMethod
    public void stopCardEmulation(PluginCall call) {
        getContext().getSharedPreferences("lingoung_nfc", Activity.MODE_PRIVATE)
            .edit().remove("payment_token").apply();
        call.resolve();
    }

    @PluginMethod
    public void readPaymentToken(PluginCall call) {
        NfcAdapter adapter = NfcAdapter.getDefaultAdapter(getContext());
        if (adapter == null || !adapter.isEnabled()) {
            call.reject("NFC is unavailable or disabled");
            return;
        }
        if (pendingRead != null) {
            call.reject("NFC reader is already active");
            return;
        }
        pendingRead = call;
        getActivity().runOnUiThread(() -> adapter.enableReaderMode(
            getActivity(),
            this::handleTag,
            NfcAdapter.FLAG_READER_NFC_A
                | NfcAdapter.FLAG_READER_SKIP_NDEF_CHECK
                | NfcAdapter.FLAG_READER_NO_PLATFORM_SOUNDS,
            null
        ));
    }

    @PluginMethod
    public void cancelRead(PluginCall call) {
        disableReader();
        if (pendingRead != null) {
            pendingRead.reject("NFC read cancelled");
            pendingRead = null;
        }
        call.resolve();
    }

    private void handleTag(Tag tag) {
        PluginCall call = pendingRead;
        if (call == null) return;
        IsoDep isoDep = IsoDep.get(tag);
        if (isoDep == null) {
            call.reject("This NFC device is not a Lingoung payment card");
            pendingRead = null;
            disableReader();
            return;
        }
        try {
            isoDep.connect();
            byte[] selectResponse = isoDep.transceive(SELECT_AID);
            if (!isSuccess(selectResponse)) throw new IllegalStateException("Lingoung card not found");
            byte[] tokenResponse = isoDep.transceive(GET_TOKEN);
            if (!isSuccess(tokenResponse) || tokenResponse.length <= 2) throw new IllegalStateException("Payment authorization unavailable");
            String token = new String(Arrays.copyOf(tokenResponse, tokenResponse.length - 2), StandardCharsets.UTF_8);
            JSObject result = new JSObject();
            result.put("token", token);
            call.resolve(result);
        } catch (Exception error) {
            call.reject(error.getMessage(), error);
        } finally {
            try { isoDep.close(); } catch (Exception ignored) {}
            pendingRead = null;
            disableReader();
        }
    }

    private void disableReader() {
        NfcAdapter adapter = NfcAdapter.getDefaultAdapter(getContext());
        if (adapter != null && getActivity() != null) {
            getActivity().runOnUiThread(() -> adapter.disableReaderMode(getActivity()));
        }
    }

    private static boolean isSuccess(byte[] response) {
        return response != null
            && response.length >= 2
            && response[response.length - 2] == (byte) 0x90
            && response[response.length - 1] == 0x00;
    }

    private static byte[] hex(String value) {
        int length = value.length();
        byte[] bytes = new byte[length / 2];
        for (int i = 0; i < length; i += 2) {
            bytes[i / 2] = (byte) ((Character.digit(value.charAt(i), 16) << 4)
                + Character.digit(value.charAt(i + 1), 16));
        }
        return bytes;
    }
}