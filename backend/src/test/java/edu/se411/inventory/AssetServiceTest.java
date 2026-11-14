package edu.se411.inventory;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.web.server.ResponseStatusException;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
@ExtendWith(MockitoExtension.class)
class AssetServiceTest {
 @Mock AssetRepository repository;
 @InjectMocks AssetService service;
 Asset asset=new Asset("PC-001","Laptop","Dell","","Lab","Available","");
 @Test void createsAndNormalizes() { var saved=service.create(new Asset("pc-001"," Laptop ","Dell","","Lab","Available","")); assertEquals(asset,saved); verify(repository).insert(asset); }
 @Test void duplicateReturnsConflict() { doThrow(new DuplicateKeyException("duplicate")).when(repository).insert(asset); assertEquals(409,assertThrows(ResponseStatusException.class,()->service.create(asset)).getStatusCode().value()); }
 @Test void getsCaseInsensitiveId() { when(repository.findById("PC-001")).thenReturn(Optional.of(asset)); assertEquals(asset,service.get("pc-001")); }
 @Test void missingReturns404() { assertEquals(404,assertThrows(ResponseStatusException.class,()->service.get("missing")).getStatusCode().value()); }
 @Test void paginatesAndFilters() { when(repository.findAll()).thenReturn(List.of(asset,new Asset("PC-002","Desktop","HP","","Office","Available",""))); var page=service.list(1,1,"","All"); assertEquals("PC-002",page.content().get(0).id()); assertEquals(2,page.totalElements()); assertEquals(2,page.totalPages()); assertEquals(1,service.list(0,5,"dell","Available").totalElements()); assertTrue(service.list(9,5,"","All").content().isEmpty()); }
 @Test void rejectsInvalidPaginationAndStatus() { assertThrows(ResponseStatusException.class,()->service.list(-1,5,"","All")); assertThrows(ResponseStatusException.class,()->service.list(0,101,"","All")); assertThrows(ResponseStatusException.class,()->service.list(0,5,"","Broken")); }
 @Test void updatesExisting() { when(repository.update(asset)).thenReturn(1); assertEquals(asset,service.update("pc-001",asset)); }
 @Test void rejectsRenaming() { assertThrows(ResponseStatusException.class,()->service.update("PC-999",asset)); verifyNoInteractions(repository); }
 @Test void missingUpdateReturns404() { assertEquals(404,assertThrows(ResponseStatusException.class,()->service.update("PC-001",asset)).getStatusCode().value()); }
 @Test void requiresAssignedOwner() { assertThrows(ResponseStatusException.class,()->service.create(new Asset("A","A","A"," ","A","Assigned",""))); verifyNoInteractions(repository); }
 @Test void rejectsInvalidDate() { assertThrows(ResponseStatusException.class,()->service.create(new Asset("A","A","A","","A","Available","2026-02-30"))); }
 @Test void deletesExisting() { when(repository.delete("PC-001")).thenReturn(1); service.delete("pc-001"); verify(repository).delete("PC-001"); }
 @Test void missingDeleteReturns404() { assertEquals(404,assertThrows(ResponseStatusException.class,()->service.delete("X")).getStatusCode().value()); }
}
