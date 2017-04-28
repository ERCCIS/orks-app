<ul class="table-view core inputs no-top <%- obj.isSynchronising ? 'disabled' : '' %>">
  <li class="table-view-cell">
    <a id="species-button" class="navigate-right">
      <% if (obj.commonName) { %>
      <span class="media-object pull-right descript"><%- obj.commonName %></span>
      <% } %>
      <span class="media-object pull-right descript"><i><%- obj.scientificName %></i></span>
    </a>
  </li>
  <li class="table-view-cell">
    <a href="#surveys/<%- obj.surveySampleID %>/edit/samples/<%- obj.id %>/edit/location"
       id="location-button"
       class="<%- obj.locks['location'] ? 'lock' : 'navigate-right' %>">
      <span class="media-object pull-left icon icon-location"></span>

      <% if (obj.location_name) { %>
      <span class="media-object pull-right descript"><%= obj.location_name %></span>
      <% } else { %>
      <span class="media-object pull-right descript error">Name missing</span>
      <% } %>

      <% if (obj.location) { %>
      <span class="media-object pull-right descript"><%- obj.location %></span>
      <% } else { %>
      <% if (obj.isLocating) { %>
      <span class="media-object pull-right descript warn">Locating...</span>
      <% } else { %>
      <span class="media-object pull-right descript error">Location missing</span>
      <% } %>
      <% } %>
      Location
    </a>
  </li>
  <li class="table-view-cell">
    <a href="#surveys/<%- obj.surveySampleID %>/edit/samples/<%- obj.id %>/edit/stage" id="comment-button"
       class="<%- obj.locks['comment'] ? 'lock' : 'navigate-right' %>">
      <span class="media-object pull-left icon icon-comment"></span>
      <span class="media-object pull-right descript"><%= obj.stage %></span>
      Stage
    </a>
  </li>
  <li class="table-view-cell">
    <a href="#surveys/<%- obj.surveySampleID %>/edit/samples/<%- obj.id %>/edit/abundance" id="comment-button"
       class="<%- obj.locks['comment'] ? 'lock' : 'navigate-right' %>">
      <span class="media-object pull-left icon icon-comment"></span>
      <span class="media-object pull-right descript"><%= obj.abundance %></span>
      Abundance
    </a>
  </li>
  <li class="table-view-cell">
    <a href="#surveys/<%- obj.surveySampleID %>/edit/samples/<%- obj.id %>/edit/status" id="comment-button"
       class="<%- obj.locks['comment'] ? 'lock' : 'navigate-right' %>">
      <span class="media-object pull-left icon icon-comment"></span>
      <span class="media-object pull-right descript"><%= obj.status %></span>
      Status
    </a>
  </li>
  <li class="table-view-cell">
    <a href="#surveys/<%- obj.surveySampleID %>/edit/samples/<%- obj.id %>/edit/identifiers" id="comment-button"
       class="<%- obj.locks['comment'] ? 'lock' : 'navigate-right' %>">
      <span class="media-object pull-left icon icon-comment"></span>
      <span class="media-object pull-right descript"><%= obj.identifiers %></span>
      Determiner
    </a>
  </li>
  <li class="table-view-cell">
    <a href="#surveys/<%- obj.surveySampleID %>/edit/samples/<%- obj.id %>/edit/comment" id="comment-button"
       class="<%- obj.locks['comment'] ? 'lock' : 'navigate-right' %>">
      <span class="media-object pull-left icon icon-comment"></span>
      <span class="media-object pull-right descript"><%= obj.comment %></span>
      Comment
    </a>
  </li>
</ul>
