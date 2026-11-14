package edu.se411.inventory;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.http.MediaType;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
@SpringBootTest(properties="spring.datasource.url=jdbc:h2:mem:apitest;DB_CLOSE_DELAY=-1")
@AutoConfigureMockMvc
class AssetApiTest {
 @Autowired MockMvc mvc;
 String body="{\"id\":\"TEST-001\",\"name\":\"Test laptop\",\"brand\":\"Dell\",\"assignee\":\"\",\"location\":\"Lab\",\"status\":\"Available\",\"purchased\":\"2026-10-01\"}";
 @Test void completeLifecycle() throws Exception {
  mvc.perform(post("/api/assets").contentType(MediaType.APPLICATION_JSON).content(body)).andExpect(status().isCreated()).andExpect(header().string("Location","/api/assets/TEST-001"));
  mvc.perform(post("/api/assets").contentType(MediaType.APPLICATION_JSON).content(body)).andExpect(status().isConflict());
  mvc.perform(get("/api/assets/test-001")).andExpect(status().isOk()).andExpect(jsonPath("$.name").value("Test laptop"));
  mvc.perform(get("/api/assets?size=2&page=1")).andExpect(status().isOk()).andExpect(jsonPath("$.content.length()").value(2)).andExpect(jsonPath("$.totalElements").value(6));
  mvc.perform(put("/api/assets/TEST-001").contentType(MediaType.APPLICATION_JSON).content(body.replace("Test laptop","Updated"))).andExpect(status().isOk()).andExpect(jsonPath("$.name").value("Updated"));
  mvc.perform(get("/api/assets?query=updated&status=Available")).andExpect(jsonPath("$.totalElements").value(1));
  mvc.perform(delete("/api/assets/TEST-001")).andExpect(status().isNoContent());
  mvc.perform(get("/api/assets/TEST-001")).andExpect(status().isNotFound());
 }
 @Test void rejectsInvalidRequests() throws Exception {
  mvc.perform(post("/api/assets").contentType(MediaType.APPLICATION_JSON).content(body.replace("TEST-001","bad/id"))).andExpect(status().isBadRequest());
  mvc.perform(post("/api/assets").contentType(MediaType.APPLICATION_JSON).content(body.replace("Test laptop"," "))).andExpect(status().isBadRequest());
  mvc.perform(post("/api/assets").contentType(MediaType.APPLICATION_JSON).content(body.replace("Available","Assigned"))).andExpect(status().isBadRequest());
  mvc.perform(get("/api/assets?page=-1")).andExpect(status().isBadRequest());
  mvc.perform(get("/api/assets?size=0")).andExpect(status().isBadRequest());
  mvc.perform(get("/api/assets?page=no")).andExpect(status().isBadRequest());
  mvc.perform(put("/api/assets/MISSING").contentType(MediaType.APPLICATION_JSON).content(body.replace("TEST-001","MISSING"))).andExpect(status().isNotFound());
  mvc.perform(delete("/api/assets/MISSING")).andExpect(status().isNotFound());
 }
}
