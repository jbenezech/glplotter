attribute vec3 a_position;
    
uniform mat4 u_translationMatrix;
uniform mat4 u_scaleMatrix;
uniform mat4 u_modelMatrix;
uniform mat4 u_projectionMatrix;

void main(void) {

  vec3 pos = a_position;
      
  vec4 scaled_position = u_modelMatrix * u_scaleMatrix * vec4(pos, 1.0);

  gl_Position = u_translationMatrix * u_projectionMatrix * u_modelMatrix * scaled_position;

}