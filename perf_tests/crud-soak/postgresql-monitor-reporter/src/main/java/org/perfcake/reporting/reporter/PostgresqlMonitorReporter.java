/*
 * -----------------------------------------------------------------------\
 * PerfCake
 *  
 * Copyright (C) 2010 - 2016 the original author or authors.
 *  
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *      http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * -----------------------------------------------------------------------/
 */
package org.perfcake.reporting.reporter;

import org.perfcake.common.PeriodType;
import org.perfcake.reporting.Measurement;
import org.perfcake.reporting.MeasurementUnit;
import org.perfcake.reporting.Quantity;
import org.perfcake.reporting.ReportingException;
import org.perfcake.reporting.destination.Destination;
import org.perfcake.util.properties.MandatoryProperty;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.text.SimpleDateFormat;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Executes SQL queries to PostgreSQL DB's stat tables to get monitoring statistics about
 * the DB.
 *
 * @author <a href="mailto:pavel.macik@gmail.com">Pavel Macík</a>
 */
public class PostgresqlMonitorReporter extends AbstractReporter {

   private Connection connection;

   private Statement statement;

   private String dbUser = null;
   private String dbPassword = null;
   private String dbDriverClass = "org.postgresql.Driver";
   private String dbHost = "localhost";
   private int dbPort = 5432;
   @MandatoryProperty
   private String dbName = "";

   /**
    * The sender's logger.
    */
   private static final Logger log = LogManager.getLogger(PostgresqlMonitorReporter.class);

   @Override
   public void start() {
      super.start();
      try {
         Class.forName(dbDriverClass);
      } catch (ClassNotFoundException csfe) {
         csfe.printStackTrace();
      }

      SimpleDateFormat format = new SimpleDateFormat("HH:mm:ss.SSS");
      try {
         if (dbUser != null) {
            connection = DriverManager.getConnection("jdbc:postgresql://" + dbHost + ":" + dbPort + "/" + dbName, dbUser, dbPassword);
         } else {
            connection = DriverManager.getConnection("jdbc:postgresql://" + dbHost + ":" + dbPort + "/" + dbName);
         }
         statement = connection.createStatement();
      } catch (SQLException sqle) {
         sqle.printStackTrace();
      }
   }

   @Override
   protected void doReset() {
      //nop
   }

   @Override
   protected void doReport(final MeasurementUnit measurementUnit) throws ReportingException {
      //nop
   }

   @Override
   public void publishResult(final PeriodType periodType, final Destination destination) throws ReportingException {
      final Measurement m = newMeasurement();
      try {
         ResultSet rs = statement.executeQuery("SELECT max(now()-xact_start) FROM pg_stat_activity WHERE state IN ('idle in transaction','active');");
         rs.next();
         m.set("MaxTransactionTime", (new Quantity<Number>(rs.getTimestamp(1).getNanos() / 1e6, "ms")));

         int idle = 0;
         int active = 0;
         int idleInTransaction = 0;
         int unknown = 0;
         rs = statement.executeQuery("SELECT pid, state, datname, usename, query FROM pg_stat_activity ORDER BY state ASC");
         final StringBuffer queriesJson = new StringBuffer();
         queriesJson.append("{\"queries\":[");
         int i = 0;
         while (rs.next()) {
            if (i > 0) {
               queriesJson.append(",");
            }
            final String state = rs.getString("state");
            if (state == null) {
               unknown++;
               queriesJson.append("{\"unknown\":\"n/a\"}");
            } else {
               queriesJson.append("{\"")
                          .append(state)
                          .append("\":\"")
                          .append(rs.getString("query")
                                    .replaceAll(Pattern.quote("\""), Matcher.quoteReplacement("\\\""))
                                    .replaceAll(Pattern.quote("\n"), Matcher.quoteReplacement("\\n"))
                                    .replaceAll(Pattern.quote("\t"), Matcher.quoteReplacement("\\t"))
                                    .replaceAll(Pattern.quote("\r"), Matcher.quoteReplacement("\\r"))).append("\"}");
               switch (rs.getString("state")) {
                  case "active":
                     active++;
                     break;
                  case "idle":
                     idle++;
                     break;
                  case "idle in transaction":
                     idleInTransaction++;
                     break;
               }
            }
            i++;
         }
         queriesJson.append("]}");
         m.set("Active", active);
         m.set("Idle", idle);
         m.set("IdleInTransaction", idleInTransaction);
         m.set("Unknown", unknown);
         m.set("Queries", queriesJson.toString());

         destination.report(m);

         if (log.isDebugEnabled()) {
            log.debug("Reporting: [" + m.toString() + "]");
         }
      } catch (SQLException sqle) {
         throw new ReportingException("Unable to execute SQL query.", sqle);
      }
   }

   @Override
   public void stop() {
      super.stop();
      if (connection != null) {
         try {
            connection.close();
         } catch (SQLException sqle) {
            sqle.printStackTrace();
         }
      }
   }

   public String getDbUser() {
      return dbUser;
   }

   public void setDbUser(final String dbUser) {
      this.dbUser = dbUser;
   }

   public String getDbPassword() {
      return dbPassword;
   }

   public void setDbPassword(final String dbPassword) {
      this.dbPassword = dbPassword;
   }

   public String getDbDriverClass() {
      return dbDriverClass;
   }

   public void setDbDriverClass(final String dbDriverClass) {
      this.dbDriverClass = dbDriverClass;
   }

   public String getDbHost() {
      return dbHost;
   }

   public void setDbHost(final String dbHost) {
      this.dbHost = dbHost;
   }

   public int getDbPort() {
      return dbPort;
   }

   public void setDbPort(final int dbPort) {
      this.dbPort = dbPort;
   }

   public String getDbName() {
      return dbName;
   }

   public void setDbName(final String dbName) {
      this.dbName = dbName;
   }
}
