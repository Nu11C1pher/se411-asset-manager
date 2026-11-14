package edu.se411.inventory;
import java.util.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;
@Repository
public class AssetRepository {
 private final JdbcTemplate jdbc;
 private final RowMapper<Asset> mapper=(r,n)->new Asset(r.getString("id"),r.getString("name"),r.getString("brand"),r.getString("assignee"),r.getString("location"),r.getString("status"),r.getString("purchased"));
 public AssetRepository(JdbcTemplate jdbc) { this.jdbc=jdbc; }
 public List<Asset> findAll() { return jdbc.query("SELECT * FROM assets ORDER BY id",mapper); }
 public Optional<Asset> findById(String id) { return jdbc.query("SELECT * FROM assets WHERE id=?",mapper,id).stream().findFirst(); }
 public void insert(Asset a) { jdbc.update("INSERT INTO assets VALUES (?,?,?,?,?,?,?)",a.id(),a.name(),a.brand(),a.assignee(),a.location(),a.status(),a.purchased()); }
 public int update(Asset a) { return jdbc.update("UPDATE assets SET name=?,brand=?,assignee=?,location=?,status=?,purchased=? WHERE id=?",a.name(),a.brand(),a.assignee(),a.location(),a.status(),a.purchased(),a.id()); }
 public int delete(String id) { return jdbc.update("DELETE FROM assets WHERE id=?",id); }
}
