package edu.se411.inventory;
import jakarta.validation.Valid;
import java.net.URI;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
@RestController
@RequestMapping("/api/assets")
public class AssetController {
 private final AssetService service;
 public AssetController(AssetService service) { this.service=service; }
 @GetMapping public AssetService.AssetPage list(@RequestParam(defaultValue="0") int page,@RequestParam(defaultValue="5") int size,@RequestParam(defaultValue="") String query,@RequestParam(defaultValue="All") String status) { return service.list(page,size,query,status); }
 @GetMapping("/{id}") public Asset get(@PathVariable String id) { return service.get(id); }
 @PostMapping public ResponseEntity<Asset> create(@Valid @RequestBody Asset asset) { Asset saved=service.create(asset); return ResponseEntity.created(URI.create("/api/assets/"+saved.id())).body(saved); }
 @PutMapping("/{id}") public Asset update(@PathVariable String id,@Valid @RequestBody Asset asset) { return service.update(id,asset); }
 @DeleteMapping("/{id}") public ResponseEntity<Void> delete(@PathVariable String id) { service.delete(id); return ResponseEntity.noContent().build(); }
}
