package edu.se411.inventory;
import java.util.*;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import org.springframework.stereotype.Service;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
@Service
public class AssetService {
 private final AssetRepository repository;
 public AssetService(AssetRepository repository) { this.repository=repository; }
 public record AssetPage(List<Asset> content,int number,int size,long totalElements,int totalPages) {}
 private String key(String id) { return id.trim().toUpperCase(Locale.ROOT); }
 public Asset get(String id) { return repository.findById(key(id)).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Computer not found.")); }
 public AssetPage list(int page,int size,String query,String status) {
  if(page<0 || size<1 || size>100) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Page must be non-negative and size between 1 and 100.");
  if(!List.of("All","Available","Assigned","Maintenance","Retired").contains(status)) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Invalid status.");
  String q=query.trim().toLowerCase(Locale.ROOT);
  List<Asset> rows=repository.findAll().stream().filter(a->status.equals("All")||a.status().equals(status)).filter(a->String.join(" ",a.id(),a.name(),a.brand(),a.assignee(),a.location(),a.status(),a.purchased()).toLowerCase(Locale.ROOT).contains(q)).toList();
  int start=(int)Math.min((long)page*size,rows.size());
  return new AssetPage(rows.subList(start,Math.min(start+size,rows.size())),page,size,rows.size(),(rows.size()+size-1)/size);
 }
 private Asset checked(Asset raw) {
  Asset a=raw.normalized();
  if(a.status().equals("Assigned") && a.assignee().isBlank()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Assigned computers need an assignee.");
  try { if(!a.purchased().isEmpty()) LocalDate.parse(a.purchased()); } catch(DateTimeParseException e) { throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Invalid purchase date."); }
  return a;
 }
 public Asset create(Asset raw) {
  Asset a=checked(raw);
  try { repository.insert(a); } catch(DuplicateKeyException e) { throw new ResponseStatusException(HttpStatus.CONFLICT,"This asset ID already exists."); }
  return a;
 }
 public Asset update(String id,Asset raw) {
  Asset a=checked(raw);
  if(!key(id).equals(a.id())) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Asset ID cannot be changed.");
  if(repository.update(a)==0) throw new ResponseStatusException(HttpStatus.NOT_FOUND,"Computer not found.");
  return a;
 }
 public void delete(String id) { if(repository.delete(key(id))==0) throw new ResponseStatusException(HttpStatus.NOT_FOUND,"Computer not found."); }
}
