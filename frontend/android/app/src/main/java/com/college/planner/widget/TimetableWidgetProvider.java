package com.college.planner.widget;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.widget.RemoteViews;
import android.widget.Toast;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Locale;

import com.college.planner.MainActivity;
import com.college.planner.R;

public class TimetableWidgetProvider extends AppWidgetProvider {

    private static final String PREFS_NAME = "TimetableWidget";
    private static final String SUBJECT_CLICK_ACTION = "com.college.planner.SUBJECT_CLICK";

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId);
        }
    }

    @Override
    public void onReceive(Context context, Intent intent) {
        super.onReceive(context, intent);
        
        if (SUBJECT_CLICK_ACTION.equals(intent.getAction())) {
            String subject = intent.getStringExtra("subject");
            if (subject != null && !subject.equals("Lunch Break") && !subject.equals("Free Period")) {
                // Open app with subject syllabus
                Intent appIntent = new Intent(context, MainActivity.class);
                appIntent.putExtra("openSubject", subject);
                appIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                context.startActivity(appIntent);
            }
        }
    }

    static void updateAppWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        
        // Get current day and time
        Calendar calendar = Calendar.getInstance();
        SimpleDateFormat dayFormat = new SimpleDateFormat("EEEE", Locale.getDefault());
        SimpleDateFormat timeFormat = new SimpleDateFormat("HH:mm", Locale.getDefault());
        
        String currentDay = dayFormat.format(calendar.getTime());
        String currentTime = timeFormat.format(calendar.getTime());
        
        // Create RemoteViews object
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.timetable_widget);
        
        // Update day and time
        views.setTextViewText(R.id.widget_day, currentDay);
        views.setTextViewText(R.id.widget_current_time, currentTime);
        
        // Load timetable data from SharedPreferences (synced from Capacitor)
        SharedPreferences prefs = context.getSharedPreferences("CapacitorStorage", Context.MODE_PRIVATE);
        String timetableJson = prefs.getString("collegeTimetable", "{}");
        
        // Clear existing schedule
        views.removeAllViews(R.id.widget_schedule_container);
        
        // Sample schedule data (you would parse the JSON here)
        String[] timeSlots = {
            "9:00 - 10:00", "10:00 - 11:00", "11:15 - 12:15", 
            "12:15 - 1:15", "2:15 - 3:15", "3:15 - 4:15", "4:30 - 5:30"
        };
        
        String[] subjects = {
            "Mathematics", "Physics", "Chemistry", 
            "Lunch Break", "Computer Science", "English Literature", "Free Period"
        };
        
        // Add schedule items
        for (int i = 0; i < timeSlots.length; i++) {
            RemoteViews scheduleItem = new RemoteViews(context.getPackageName(), R.layout.widget_schedule_item);
            
            scheduleItem.setTextViewText(R.id.schedule_time, timeSlots[i]);
            scheduleItem.setTextViewText(R.id.schedule_subject, subjects[i]);
            
            // Set colors based on subject type
            if (subjects[i].equals("Lunch Break")) {
                scheduleItem.setInt(R.id.schedule_item_background, "setBackgroundColor", 
                    context.getResources().getColor(R.color.widget_lunch_break));
            } else if (subjects[i].equals("Free Period")) {
                scheduleItem.setInt(R.id.schedule_item_background, "setBackgroundColor", 
                    context.getResources().getColor(R.color.widget_free_period));
            } else {
                scheduleItem.setInt(R.id.schedule_item_background, "setBackgroundColor", 
                    context.getResources().getColor(R.color.widget_primary_color));
            }
            
            // Set click intent for subjects
            Intent clickIntent = new Intent(context, TimetableWidgetProvider.class);
            clickIntent.setAction(SUBJECT_CLICK_ACTION);
            clickIntent.putExtra("subject", subjects[i]);
            
            PendingIntent pendingIntent = PendingIntent.getBroadcast(context, i, clickIntent, 
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
            scheduleItem.setOnClickPendingIntent(R.id.schedule_item_background, pendingIntent);
            
            views.addView(R.id.widget_schedule_container, scheduleItem);
        }
        
        // Set click intent for widget title to open main app
        Intent intent = new Intent(context, MainActivity.class);
        PendingIntent pendingIntent = PendingIntent.getActivity(context, 0, intent, 
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        views.setOnClickPendingIntent(R.id.widget_title, pendingIntent);
        
        // Update the widget
        appWidgetManager.updateAppWidget(appWidgetId, views);
    }
}