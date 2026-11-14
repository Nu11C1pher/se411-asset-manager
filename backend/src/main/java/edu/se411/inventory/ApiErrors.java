package edu.se411.inventory;
import java.util.Map;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.server.ResponseStatusException;
@RestControllerAdvice
public class ApiErrors {
 @ExceptionHandler(ResponseStatusException.class) public ResponseEntity<?> status(ResponseStatusException e) { return ResponseEntity.status(e.getStatusCode()).body(Map.of("message",e.getReason()==null?"Request failed.":e.getReason())); }
 @ExceptionHandler(MethodArgumentNotValidException.class) public ResponseEntity<?> invalid(MethodArgumentNotValidException e) { var error=e.getBindingResult().getFieldErrors().get(0); return ResponseEntity.badRequest().body(Map.of("message",error.getField()+": "+error.getDefaultMessage())); }
}
