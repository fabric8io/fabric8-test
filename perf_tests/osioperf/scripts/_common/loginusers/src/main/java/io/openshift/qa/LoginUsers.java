package io.openshift.qa;

import org.json.JSONObject;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.io.File;
import java.io.FileWriter;
import java.io.InputStreamReader;
import java.io.UnsupportedEncodingException;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLDecoder;
import java.util.Map;
import java.util.Properties;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Login OSIO users
 *
 * @author Pavel Macík <mailto:pavel.macik@gmail.com>
 */
public class LoginUsers {

   private static final AtomicInteger i = new AtomicInteger(1);

   public static void main(String[] args) throws Exception {
      final StringBuffer tokens = new StringBuffer();

      Properties usersProperties = new Properties();

      usersProperties.load(new InputStreamReader(LoginUsers.class.getResourceAsStream("/users.properties")));
      for (Map.Entry<Object, Object> user : usersProperties.entrySet()) {
         final String uName = user.getKey().toString();
         final String uPasswd = user.getValue().toString();

         final ChromeOptions op = new ChromeOptions();
         op.addArguments("headless");
         final WebDriver driver = new ChromeDriver(op);

         final String startUrl = System.getProperty("auth.server.address") + ":" + System.getProperty("auth.server.port") + "/api/login?redirect=http%3A%2F%2Flocalhost%3A8090%2Flink.html";
         System.out.println(startUrl);
         System.out.println("Logging user " + uName + " in...");

         driver.get(startUrl);
         long a = System.currentTimeMillis();

         new WebDriverWait(driver, 10).until(ExpectedConditions.elementToBeClickable(By.id("kc-login")));

         System.out.println(uName + "-open-login-page:" + (System.currentTimeMillis() - a) + "ms");
         driver.findElement(By.id("username")).sendKeys(uName);
         WebElement pass = driver.findElement(By.id("password"));
         pass.sendKeys(uPasswd);
         a = System.currentTimeMillis();
         pass.submit();
         (new WebDriverWait(driver, 10)).until(ExpectedConditions.urlContains("access_token"));
         System.out.println(uName + "-login:" + (System.currentTimeMillis() - a) + "ms");
         String tokenJson = null;
         String[] queryParams = new String[0];
         try {
            queryParams = new URL(URLDecoder.decode(driver.getCurrentUrl(), "UTF-8")).getQuery().split("&");
         } catch (MalformedURLException e) {
            e.printStackTrace();
         } catch (UnsupportedEncodingException e) {
            e.printStackTrace();
         }
         driver.quit();
         for (String p : queryParams) {
            if (!p.startsWith("token_json=")) {
               continue;
            } else {
               tokenJson = p.split("=")[1];
            }
         }
         JSONObject json = new JSONObject(tokenJson);
         synchronized (tokens) {
            tokens.append(json.getString("access_token"))
                  .append(";")
                  .append(json.getString("refresh_token"))
                  .append("\n");
         }
      }
      final FileWriter fw = new FileWriter(new File(System.getProperty("user.tokens.file", "user.tokens")), false);
      fw.append(tokens.toString());
      fw.close();
      System.exit(0);
   }
}
