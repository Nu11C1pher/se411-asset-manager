package edu.se411.inventory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;
@Configuration
public class SampleData {
 @Bean CommandLineRunner seed(JdbcTemplate jdbc,AssetRepository repository) { return args->{
  jdbc.execute("CREATE TABLE IF NOT EXISTS initialization (id INT PRIMARY KEY)");
  if(jdbc.queryForObject("SELECT COUNT(*) FROM initialization",Integer.class)==0) {
   if(repository.findAll().isEmpty()) {
    repository.insert(new Asset("PC-001","MacBook Pro 14","Apple","Design team","Riyadh · Floor 2","Assigned","2026-09-01"));
    repository.insert(new Asset("PC-002","ThinkPad X1 Carbon","Lenovo","Engineering","Riyadh · Floor 3","Assigned","2026-08-12"));
    repository.insert(new Asset("PC-003","OptiPlex 7020","Dell","","Equipment room","Available","2026-07-20"));
    repository.insert(new Asset("PC-004","EliteBook 840","HP","IT support","Service desk","Maintenance","2026-06-15"));
    repository.insert(new Asset("PC-005","Mac mini","Apple","","Equipment room","Available","2026-09-10"));
   }
   jdbc.update("INSERT INTO initialization VALUES (1)");
  }
 }; }
}
