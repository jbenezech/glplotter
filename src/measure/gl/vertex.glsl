attribute vec3 a_position;
    
uniform mat4 u_translationMatrix;
uniform mat4 u_scaleMatrix;
uniform mat4 u_modelMatrix;
uniform mat4 u_projectionMatrix;

void main(void) {

  vec3 pos = a_position;
  pos[2] = 0.0;
      
  vec4 scaled_position = u_modelMatrix * u_scaleMatrix * vec4(pos, 1.0);

  vec4 transformedPos = u_translationMatrix * u_projectionMatrix * u_modelMatrix * scaled_position;

  if (a_position[2] == 1.0) {
    transformedPos[0] = transformedPos[0] + 0.002; //add a width for the line, independent of scaling
  }

  gl_Position = transformedPos;
}