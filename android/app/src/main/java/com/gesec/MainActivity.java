package com.gesec;

import android.os.Bundle;
import androidx.activity.EdgeToEdge;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        EdgeToEdge.enable(this);
        setTheme(R.style.AppTheme_NoActionBar);
        super.onCreate(savedInstanceState);
    }
}
