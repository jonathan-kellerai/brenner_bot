#!/usr/bin/env bun
/**
 * Create BrennerBot GA4 Property in JeffCo Industries account
 */

import { AnalyticsAdminServiceClient } from "@google-analytics/admin";

const JEFFCO_ACCOUNT = "accounts/375919294";

async function createProperty() {
  const client = new AnalyticsAdminServiceClient();
  
  console.log("Creating BrennerBot GA4 property in JeffCo Industries...\n");
  
  try {
    const [property] = await client.createProperty({
      property: {
        parent: JEFFCO_ACCOUNT,
        displayName: "BrennerBot",
        industryCategory: "TECHNOLOGY",
        timeZone: "America/New_York",
        currencyCode: "USD",
      },
    });
    
    console.log("✓ Property created successfully!\n");
    console.log(`  Display Name: ${property.displayName}`);
    console.log(`  Resource Name: ${property.name}`);
    console.log(`  Property ID: ${property.name?.replace("properties/", "")}`);
    console.log(`  Time Zone: ${property.timeZone}`);
    console.log(`  Industry: ${property.industryCategory}`);
    
    // Extract property ID for data stream creation
    const propertyId = property.name?.replace("properties/", "");
    
    // Create a web data stream
    console.log("\nCreating web data stream...");
    
    const [dataStream] = await client.createDataStream({
      parent: property.name!,
      dataStream: {
        type: "WEB_DATA_STREAM",
        displayName: "BrennerBot Web",
        webStreamData: {
          defaultUri: "https://brennerbot.com",
        },
      },
    });
    
    console.log("✓ Web data stream created!\n");
    console.log(`  Stream Name: ${dataStream.displayName}`);
    console.log(`  Resource: ${dataStream.name}`);
    
    // Get measurement ID
    if (dataStream.webStreamData?.measurementId) {
      console.log(`\n${"=".repeat(60)}`);
      console.log("IMPORTANT - Add these to your .env.local:");
      console.log(`${"=".repeat(60)}`);
      console.log(`\nNEXT_PUBLIC_GA_MEASUREMENT_ID=${dataStream.webStreamData.measurementId}`);
      console.log(`GA_PROPERTY_ID=${propertyId}`);
      console.log(`\nNote: You'll also need to create an API secret in GA4 console:`);
      console.log(`Admin > Data Streams > [BrennerBot Web] > Measurement Protocol API secrets`);
    }
    
    return { property, dataStream, propertyId };
    
  } catch (error: any) {
    console.error("Error creating property:", error.message);
    throw error;
  }
}

createProperty().catch(console.error);
