import { AnalyticsAdminServiceClient } from "@google-analytics/admin";

async function listAccounts() {
  const client = new AnalyticsAdminServiceClient();
  
  console.log("Listing Google Analytics accounts...\n");
  
  const [accounts] = await client.listAccounts({});
  
  if (!accounts || accounts.length === 0) {
    console.log("No GA accounts found.");
    return;
  }
  
  for (const account of accounts) {
    console.log(`Account: ${account.displayName}`);
    console.log(`  Name: ${account.name}`);
    console.log(`  Created: ${account.createTime?.seconds}`);
    console.log("");
    
    // List properties for this account
    try {
      const [properties] = await client.listProperties({
        filter: `parent:${account.name}`,
      });
      
      if (properties && properties.length > 0) {
        console.log("  Properties:");
        for (const prop of properties) {
          console.log(`    - ${prop.displayName}`);
          console.log(`      Resource: ${prop.name}`);
          console.log(`      Industry: ${prop.industryCategory}`);
          console.log(`      Timezone: ${prop.timeZone}`);
        }
      } else {
        console.log("  Properties: None");
      }
    } catch (e: any) {
      console.log(`  Properties: Error listing - ${e.message}`);
    }
    console.log("\n" + "=".repeat(60) + "\n");
  }
}

listAccounts().catch(console.error);
